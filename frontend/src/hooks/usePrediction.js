"use client";

import { useEffect, useMemo, useState } from "react";
import { predict } from "@/lib/predict";
import { getCachedPrediction } from "@/utils/predictionCache";

function formatCurrency(value, fallback) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return `₹${Math.round(numericValue)}/kg`;
}

export function usePrediction(input, predictionMode = "adaptive") {
  const [prediction, setPrediction] = useState({
    yield: "--",
    demand: "--",
    price: { sellNow: "--", wait: "--" },
    modeUsed: "cache"
  });

  const normalizedInput = useMemo(() => input || {}, [input]);

  useEffect(() => {
    let cancelled = false;

    const loadPrediction = async () => {
      try {
        const payload = await predict({
          crop: normalizedInput?.crop,
          location: normalizedInput?.location,
          timeline: normalizedInput?.timeline || normalizedInput?.activities || [],
          mode: predictionMode
        });

        const serverPrediction = payload?.prediction || {};
        const fallbackPrediction = getCachedPrediction(normalizedInput);

        if (!cancelled) {
          setPrediction({
            yield: serverPrediction.yield != null
              ? `${Number(serverPrediction.yield).toFixed(1)} tons`
              : fallbackPrediction.yield,
            demand: serverPrediction.demand || fallbackPrediction.demand,
            price: {
              sellNow: formatCurrency(serverPrediction.sellNow, fallbackPrediction.price.sellNow),
              wait: formatCurrency(serverPrediction.wait, fallbackPrediction.price.wait)
            },
            modeUsed: serverPrediction.modeUsed || fallbackPrediction.modeUsed
          });
        }
      } catch {
        if (!cancelled) {
          setPrediction(getCachedPrediction(normalizedInput));
        }
      }
    };

    loadPrediction();

    return () => {
      cancelled = true;
    };
  }, [normalizedInput, predictionMode]);

  return prediction;
}
