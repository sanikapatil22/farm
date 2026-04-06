function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getTimelineEntries(input: any) {
  if (Array.isArray(input?.timeline)) return input.timeline;
  if (Array.isArray(input?.activities)) return input.activities;
  if (Array.isArray(input?.history)) return input.history;
  return [];
}

function getMarketSnapshot(input: any) {
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

function getActivitySnapshot(input: any) {
  const timeline = getTimelineEntries(input);
  const activityCount = timeline.length;
  const harvestCount = timeline.filter((entry) => {
    const activityType = String(entry?.activityType || entry?.type || entry?.title || "").toUpperCase();
    return ["HARVEST", "PACKED", "SHIPPED"].includes(activityType);
  }).length;
  const careCount = timeline.filter((entry) => {
    const activityType = String(entry?.activityType || entry?.type || entry?.title || "").toUpperCase();
    return ["SEEDING", "WATERING", "FERTILIZER", "PESTICIDE"].includes(activityType);
  }).length;

  const recentTimestamp = timeline
    .map((entry) => new Date(entry?.date || entry?.createdAt || entry?.timestamp || 0).getTime())
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((left, right) => right - left)[0] || 0;

  const sowingDate = new Date(input?.sowingDate || 0).getTime();
  const expectedHarvestDate = new Date(input?.expectedHarvestDate || 0).getTime();
  const now = Date.now();
  const ageDays = sowingDate > 0 ? Math.max((now - sowingDate) / 86400000, 0) : 0;
  const daysToHarvest = expectedHarvestDate > 0 ? (expectedHarvestDate - now) / 86400000 : null;

  return {
    activityCount,
    harvestCount,
    careCount,
    recentActivityAgeDays: recentTimestamp > 0 ? Math.max((now - recentTimestamp) / 86400000, 0) : null,
    ageDays,
    daysToHarvest
  };
}

function calculateDemandScore(activitySnapshot: ReturnType<typeof getActivitySnapshot>, marketSnapshot: ReturnType<typeof getMarketSnapshot>) {
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

export function getCachedPrediction(input: any) {
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

  const demandLabel = demandScore >= 0.66 ? "High" : demandScore <= 0.38 ? "Low" : "Medium";

  return {
    yield: `${yieldTons.toFixed(1)} tons`,
    demand: demandLabel,
    price: {
      sellNow: `₹${sellNow}/kg`,
      wait: `₹${wait}/kg`
    },
    modeUsed: "cache"
  };
}
