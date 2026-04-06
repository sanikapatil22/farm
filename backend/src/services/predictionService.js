const predictionCache = require('../data/predictionCache');

const Mode = Object.freeze({
  AI: 'ai',
  CACHE: 'cache',
  ADAPTIVE: 'adaptive'
});

function normalizeCropKey(crop) {
  return String(crop || '').trim().toLowerCase();
}

function normalizeDemand(value) {
  const text = String(value || '').trim().toLowerCase();
  if (text === 'high') return 'High';
  if (text === 'low') return 'Low';
  return 'Medium';
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cachePrediction(crop) {
  const key = normalizeCropKey(crop);
  return predictionCache[key] || predictionCache.default;
}

function hasValidKey() {
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) return false;
  if (key === 'placeholder') return false;
  if (key.length < 10) return false;
  return true;
}

function parseModelJson(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    throw new Error('Empty AI response');
  }

  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid AI JSON response');
  }
}

async function aiPrediction({ crop, location, timeline }) {
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const activityList = Array.isArray(timeline)
    ? timeline
        .map((item) => item?.activityType || item?.type || item?.title)
        .filter(Boolean)
        .join(', ')
    : '';

  const prompt = [
    'Predict agricultural output for this farm batch.',
    `Crop: ${crop || 'unknown'}`,
    `Location: ${location || 'unknown'}`,
    `Activities: ${activityList || 'none'}`,
    'Return strict JSON only with keys: yield, demand, sellNow, wait.',
    'demand must be one of High, Medium, Low.',
    'yield, sellNow, wait must be numbers.'
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: prompt,
      max_output_tokens: 200
    })
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const modelText = data?.output_text || '';
  const parsed = parseModelJson(modelText);

  return {
    yield: toNumber(parsed?.yield, predictionCache.default.yield),
    demand: normalizeDemand(parsed?.demand),
    sellNow: toNumber(parsed?.sellNow, predictionCache.default.sellNow),
    wait: toNumber(parsed?.wait, predictionCache.default.wait)
  };
}

async function predict({ crop, location, timeline, mode }) {
  const selectedMode = String(mode || Mode.ADAPTIVE).trim().toLowerCase();

  if (selectedMode === Mode.CACHE) {
    return {
      ...cachePrediction(crop),
      modeUsed: Mode.CACHE
    };
  }

  if (selectedMode === Mode.AI) {
    if (!hasValidKey()) {
      return {
        ...cachePrediction(crop),
        modeUsed: Mode.CACHE,
        fallback: true
      };
    }

    try {
      const aiResult = await aiPrediction({ crop, location, timeline });
      return {
        ...aiResult,
        modeUsed: Mode.AI
      };
    } catch (_) {
      return {
        ...cachePrediction(crop),
        modeUsed: Mode.CACHE,
        fallback: true
      };
    }
  }

  if (String(process.env.OPENAI_API_KEY || '').trim()) {
    try {
      const aiResult = await aiPrediction({ crop, location, timeline });
      return {
        ...aiResult,
        modeUsed: Mode.AI
      };
    } catch (_) {
      return {
        ...cachePrediction(crop),
        modeUsed: Mode.CACHE
      };
    }
  }

  return {
    ...cachePrediction(crop),
    modeUsed: Mode.CACHE
  };
}

module.exports = {
  Mode,
  cachePrediction,
  aiPrediction,
  predict
};
