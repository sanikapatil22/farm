const mongoose = require('mongoose');
const Batch = require('../models/batch');
const Certification = require('../models/Certification');

function hasOutOfOrderTimeline(activities) {
  for (let i = 1; i < activities.length; i += 1) {
    const prev = new Date(activities[i - 1].date).getTime();
    const curr = new Date(activities[i].date).getTime();
    if (Number.isFinite(prev) && Number.isFinite(curr) && curr < prev) {
      return true;
    }
  }
  return false;
}

function hasLargeGap(activities, thresholdDays = 7) {
  if (activities.length < 2) return false;
  const sorted = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(sorted[i - 1].date).getTime();
    const curr = new Date(sorted[i].date).getTime();
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) continue;
    const days = Math.floor((curr - prev) / (24 * 60 * 60 * 1000));
    if (days > thresholdDays) return true;
  }

  return false;
}

function hasMissingCriticalSteps(activities) {
  const types = new Set((activities || []).map((a) => a.activityType));
  if (types.has('HARVEST') && !types.has('SEEDING')) return true;
  if (types.has('SEEDING') && types.has('HARVEST')) {
    if (!types.has('WATERING') || !types.has('FERTILIZER')) {
      return true;
    }
  }
  return false;
}

function complianceScore(activities) {
  const chemActivities = (activities || []).filter(
    (a) => a.activityType === 'FERTILIZER' || a.activityType === 'PESTICIDE'
  );

  if (chemActivities.length === 0) {
    return 90;
  }

  const organicChemCount = chemActivities.filter((a) => a.isOrganic).length;
  return Math.round((organicChemCount / chemActivities.length) * 100);
}

async function generateAICertification(batchOrId) {
  const batch = typeof batchOrId === 'string' || batchOrId instanceof mongoose.Types.ObjectId
    ? await Batch.findById(batchOrId).lean()
    : batchOrId;

  if (!batch) {
    return {
      status: 'failed',
      score: 0,
      label: 'AI Verification Unavailable'
    };
  }

  const activities = Array.isArray(batch.activities) ? batch.activities : [];
  const timelineQualityPenalty =
    (hasOutOfOrderTimeline(activities) ? 20 : 0) +
    (hasLargeGap(activities) ? 15 : 0) +
    (hasMissingCriticalSteps(activities) ? 20 : 0);

  const blockchainConfirmedRatio = activities.length
    ? activities.filter((a) => a.blockchainStatus === 'confirmed').length / activities.length
    : 0.8;

  const blockchainScore = Math.round(blockchainConfirmedRatio * 100);
  const organicCompliance = complianceScore(activities);

  const rawScore = Math.round(organicCompliance * 0.45 + blockchainScore * 0.4 + (100 - timelineQualityPenalty) * 0.15);
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    status: score >= 70 ? 'certified' : 'failed',
    score,
    label: 'AI Verified Organic'
  };
}

async function requestCertification({ batchId, authority = 'NPOP' }) {
  const existing = await Certification.findOne({ batchId, authority }).sort({ createdAt: -1 });
  if (existing && existing.status === 'pending') {
    return existing;
  }

  return Certification.create({
    batchId,
    authority,
    status: 'pending'
  });
}

async function getCertification(batchId) {
  const aiCertification = await generateAICertification(batchId);
  const thirdPartyCertification = await Certification.findOne({ batchId }).sort({ createdAt: -1 }).lean();

  return {
    aiCertification,
    thirdPartyCertification: thirdPartyCertification || null
  };
}

module.exports = {
  generateAICertification,
  requestCertification,
  getCertification
};
