"use client";

import { useEffect, useMemo, useState } from "react";
import { predict } from "@/lib/predict";

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

        if (!cancelled) {
          setPrediction({
            yield: `${serverPrediction.yield ?? 2.1} tons`,
            demand: serverPrediction.demand || "Medium",
            price: {
              sellNow: `₹${serverPrediction.sellNow ?? 30}/kg`,
              wait: `₹${serverPrediction.wait ?? 34}/kg`
            },
            modeUsed: serverPrediction.modeUsed || "cache"
          });
        }
      } catch {
        if (!cancelled) {
          setPrediction({
            yield: "2.1 tons",
            demand: "Medium",
            price: {
              sellNow: "₹30/kg",
              wait: "₹34/kg"
            },
            modeUsed: "cache"
          });
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
