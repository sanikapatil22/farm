export const predictionCache = {
  tomato: {
    yield: "2.0 tons",
    demand: "Medium",
    price: {
      sellNow: "₹32/kg",
      wait: "₹36/kg"
    }
  },
  potato: {
    yield: "1.8 tons",
    demand: "High",
    price: {
      sellNow: "₹28/kg",
      wait: "₹31/kg"
    }
  },
  onion: {
    yield: "2.3 tons",
    demand: "High",
    price: {
      sellNow: "₹26/kg",
      wait: "₹30/kg"
    }
  },
  wheat: {
    yield: "3.1 tons",
    demand: "Medium",
    price: {
      sellNow: "₹24/kg",
      wait: "₹27/kg"
    }
  },
  rice: {
    yield: "2.7 tons",
    demand: "High",
    price: {
      sellNow: "₹35/kg",
      wait: "₹39/kg"
    }
  },
  default: {
    yield: "2.1 tons",
    demand: "Medium",
    price: {
      sellNow: "₹30/kg",
      wait: "₹34/kg"
    }
  }
};

export function getCachedPrediction(crop) {
  const key = String(crop || "").trim().toLowerCase();
  if (!key) {
    return predictionCache.default;
  }

  return predictionCache[key] || predictionCache.default;
}
