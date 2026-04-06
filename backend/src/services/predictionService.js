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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getTimelineEntries(input) {
  if (Array.isArray(input?.timeline)) return input.timeline;
  if (Array.isArray(input?.activities)) return input.activities;
  if (Array.isArray(input?.history)) return input.history;
  return [];
}

function getMarketSnapshot(input) {
  const market = input?.marketConditions || {};
  const activeProducts = toNumber(market.activeProducts, 0);
  const totalProducts = Math.max(toNumber(market.totalProducts, activeProducts), 0);
  const totalAvailableQty = Math.max(toNumber(market.totalAvailableQty, toNumber(input?.quantity, 0)), 0);
  const totalSoldQty = Math.max(toNumber(market.totalSoldQty, 0), 0);
  const averageListingPrice = Math.max(
    toNumber(market.averageListingPrice, toNumber(input?.pricePerKg, 0)),
    0,
  );

  return {
    activeProducts,
    totalProducts,
    totalAvailableQty,
    totalSoldQty,
    averageListingPrice,
    inventoryPressure: clamp(
      toNumber(market.inventoryPressure, totalAvailableQty / Math.max(totalAvailableQty + totalSoldQty, 1)),
      0,
      1,
    ),
    activeListingRatio: clamp(
      toNumber(market.activeListingRatio, totalProducts > 0 ? activeProducts / totalProducts : 0),
      0,
      1,
    )
  };
}

function getActivitySnapshot(input) {
  const timeline = getTimelineEntries(input);
  const activityCount = timeline.length;
  const harvestCount = timeline.filter((entry) => {
    const activityType = String(entry?.activityType || entry?.type || entry?.title || '').toUpperCase();
    return ['HARVEST', 'PACKED', 'SHIPPED'].includes(activityType);
  }).length;
  const careCount = timeline.filter((entry) => {
    const activityType = String(entry?.activityType || entry?.type || entry?.title || '').toUpperCase();
    return ['SEEDING', 'WATERING', 'FERTILIZER', 'PESTICIDE'].includes(activityType);
  }).length;

  const recentTimestamp = timeline
    .map((entry) => new Date(entry?.date || entry?.createdAt || entry?.timestamp || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => right - left)[0] || 0;

  const sowingDate = new Date(input?.sowingDate || 0).getTime();
  const expectedHarvestDate = new Date(input?.expectedHarvestDate || 0).getTime();
  const now = Date.now();

  return {
    activityCount,
    harvestCount,
    careCount,
    recentActivityAgeDays: recentTimestamp > 0 ? Math.max((now - recentTimestamp) / 86400000, 0) : null,
    ageDays: sowingDate > 0 ? Math.max((now - sowingDate) / 86400000, 0) : 0,
    daysToHarvest: expectedHarvestDate > 0 ? (expectedHarvestDate - now) / 86400000 : null
  };
}

function calculateDemandScore(activitySnapshot, marketSnapshot) {
  const activityScore = clamp(activitySnapshot.activityCount / 8, 0, 1);
  const harvestScore = clamp(activitySnapshot.harvestCount / Math.max(activitySnapshot.activityCount || 1, 1), 0, 1);
  const careScore = clamp(activitySnapshot.careCount / Math.max(activitySnapshot.activityCount || 1, 1), 0, 1);
  const sellThroughScore = clamp(
    marketSnapshot.totalSoldQty / Math.max(marketSnapshot.totalSoldQty + marketSnapshot.totalAvailableQty, 1),
    0,
    1,
  );
  const stockPressure = marketSnapshot.inventoryPressure;
  const freshnessBoost = activitySnapshot.recentActivityAgeDays == null
    ? 0.08
    : clamp(1 - activitySnapshot.recentActivityAgeDays / 14, 0, 0.12);

  return clamp(
    0.28
      + sellThroughScore * 0.35
      + harvestScore * 0.14
      + careScore * 0.08
      + activityScore * 0.1
      + freshnessBoost
      - stockPressure * 0.18,
    0.1,
    0.9,
  );
}

function buildPredictionFromSignals(input) {
  const activitySnapshot = getActivitySnapshot(input || {});
  const marketSnapshot = getMarketSnapshot(input || {});
  const demandScore = calculateDemandScore(activitySnapshot, marketSnapshot);
  const maturityBoost = activitySnapshot.daysToHarvest == null
    ? clamp(activitySnapshot.ageDays / 120, 0, 0.35)
    : clamp((45 - activitySnapshot.daysToHarvest) / 90, 0, 0.35);

  const yieldTons = round(
    1.1
      + activitySnapshot.activityCount * 0.08
      + activitySnapshot.harvestCount * 0.45
      + activitySnapshot.careCount * 0.04
      + maturityBoost * 0.8
      + (1 - marketSnapshot.inventoryPressure) * 0.25,
    1,
  );

  const baselinePrice = marketSnapshot.averageListingPrice > 0 ? marketSnapshot.averageListingPrice : 30;
  const sellNow = Math.max(
    1,
    Math.round(
      baselinePrice * (0.9 + demandScore * 0.18 - marketSnapshot.inventoryPressure * 0.05 + maturityBoost * 0.03),
    ),
  );
  const wait = Math.max(
    sellNow,
    Math.round(sellNow * (1.04 + demandScore * 0.08 + maturityBoost * 0.05)),
  );

  return {
    yield: yieldTons,
    demand: demandScore >= 0.66 ? 'High' : demandScore <= 0.38 ? 'Low' : 'Medium',
    sellNow,
    wait
  };
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

async function aiPrediction({ crop, location, timeline, marketConditions, quantity, expectedHarvestDate, sowingDate }) {
  const key = String(process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  const basePrediction = buildPredictionFromSignals({
    crop,
    location,
    timeline,
    marketConditions,
    quantity,
    expectedHarvestDate,
    sowingDate
  });

  const activityList = Array.isArray(timeline)
    ? timeline
        .map((item) => item?.activityType || item?.type || item?.title)
        .filter(Boolean)
        .join(', ')
    : '';

  const prompt = [
    'Predict agricultural output for this farm batch from activity logs and market conditions.',
    `Crop: ${crop || 'unknown'}`,
    `Location: ${location || 'unknown'}`,
    `Activities: ${activityList || 'none'}`,
    `Market conditions: ${JSON.stringify(marketConditions || {})}`,
    `Base estimate from signals: ${JSON.stringify(basePrediction)}`,
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
    yield: toNumber(parsed?.yield, basePrediction.yield),
    demand: normalizeDemand(parsed?.demand) || basePrediction.demand,
    sellNow: toNumber(parsed?.sellNow, basePrediction.sellNow),
    wait: toNumber(parsed?.wait, basePrediction.wait)
  };
}

async function predict({ crop, location, timeline, marketConditions, mode, activities, history, quantity, expectedHarvestDate, sowingDate }) {
  const selectedMode = String(mode || Mode.ADAPTIVE).trim().toLowerCase();
  const signalInput = {
    crop,
    location,
    timeline: timeline || activities || history || [],
    marketConditions,
    quantity,
    expectedHarvestDate,
    sowingDate
  };
  const cachePrediction = buildPredictionFromSignals(signalInput);

  if (selectedMode === Mode.CACHE) {
    return {
      ...cachePrediction,
      modeUsed: Mode.CACHE,
      source: 'signals'
    };
  }

  if (selectedMode === Mode.AI) {
    if (!hasValidKey()) {
      return {
        ...cachePrediction,
        modeUsed: Mode.CACHE,
        fallback: true
      };
    }

    try {
      const aiResult = await aiPrediction({ crop, location, timeline: signalInput.timeline, marketConditions, quantity, expectedHarvestDate, sowingDate });
      return {
        ...aiResult,
        modeUsed: Mode.AI
      };
    } catch (_) {
      return {
        ...cachePrediction,
        modeUsed: Mode.CACHE,
        fallback: true
      };
    }
  }

  if (String(process.env.OPENAI_API_KEY || '').trim()) {
    try {
      const aiResult = await aiPrediction({ crop, location, timeline: signalInput.timeline, marketConditions, quantity, expectedHarvestDate, sowingDate });
      return {
        ...aiResult,
        modeUsed: Mode.AI
      };
    } catch (_) {
      return {
        ...cachePrediction,
        modeUsed: Mode.CACHE
      };
    }
  }

  return {
    ...cachePrediction,
    modeUsed: Mode.CACHE
  };
}

module.exports = {
  Mode,
  aiPrediction,
  predict
};
