const mongoose = require('mongoose');
const Batch = require('../models/batch');
const blockchainService = require('./blockchainService');
const certificationService = require('./certificationService');

function sanitizePdfText(input) {
  return String(input || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildSimplePdfBuffer(lines) {
  const pageLines = lines.slice(0, 38);
  let contentStream = 'BT\n/F1 12 Tf\n50 780 Td\n';
  pageLines.forEach((line, idx) => {
    if (idx > 0) {
      contentStream += '0 -18 Td\n';
    }
    contentStream += `(${sanitizePdfText(line)}) Tj\n`;
  });
  contentStream += 'ET';

  const objects = [];
  const offsets = [];

  const pushObject = (text) => {
    offsets.push(0);
    objects.push(text);
  };

  pushObject('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  pushObject('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  pushObject('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');
  pushObject('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  pushObject(`5 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj\n`);

  let pdf = '%PDF-1.4\n';
  for (let i = 0; i < objects.length; i += 1) {
    offsets[i] = Buffer.byteLength(pdf, 'utf8');
    pdf += objects[i];
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 0; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

async function generateReport(batchId) {
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new Error('Invalid batch id');
  }

  const batch = await Batch.findById(batchId)
    .populate({
      path: 'farm',
      populate: {
        path: 'farmer',
        select: 'name'
      }
    })
    .lean();

  if (!batch) {
    throw new Error('Batch not found');
  }

  const certification = await certificationService.getCertification(batchId);
  const blockchain = await blockchainService.checkOrganicStatus(batchId);
  const activities = Array.isArray(batch.activities) ? batch.activities : [];

  const timeline = activities.map((activity) => ({
    type: activity.activityType,
    date: activity.date,
    notes: activity.notes || activity.productName || '',
    quantity: activity.quantity,
    blockchainStatus: activity.blockchainStatus || 'pending',
    blockchainTxHash: activity.blockchainTxHash || null,
    blockchainBlock: activity.blockchainBlock || null,
    isOrganic: !!activity.isOrganic
  }));

  const blockchainLogs = activities
    .filter((activity) => activity.blockchainTxHash)
    .map((activity) => ({
      txHash: activity.blockchainTxHash,
      timestamp: activity.date,
      block: activity.blockchainBlock || null,
      status: activity.blockchainStatus || 'pending'
    }));

  const compliance = {
    organicInputs: activities.filter((a) => a.isOrganic).length,
    chemicalInputs: activities.filter((a) => a.activityType === 'FERTILIZER' || a.activityType === 'PESTICIDE').length,
    timelineEvents: timeline.length
  };

  const trustScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (certification.aiCertification?.score || 0) * 0.6 +
          ((blockchain?.verified ? 100 : 40) * 0.4)
      )
    )
  );

  return {
    batch: {
      id: String(batch._id),
      cropName: batch.cropName,
      cropCategory: batch.cropCategory,
      variety: batch.variety,
      sowingDate: batch.sowingDate,
      currentState: batch.currentState
    },
    farm: {
      id: batch.farm?._id ? String(batch.farm._id) : null,
      name: batch.farm?.farmer?.name ? `${batch.farm.farmer.name}'s Farm` : 'Farm',
      location: {
        latitude: batch.farm?.location?.latitude ?? null,
        longitude: batch.farm?.location?.longitude ?? null,
        pinCode: batch.farm?.pinCode || null
      },
      soilType: batch.farm?.soilType || null,
      organicStatus: batch.farm?.organicStatus || null
    },
    timeline,
    compliance,
    aiCertification: certification.aiCertification,
    thirdPartyCertification: certification.thirdPartyCertification,
    trustScore,
    blockchain: {
      verified: !!blockchain?.verified,
      isOrganic: !!blockchain?.isOrganic,
      activityCount: blockchain?.activityCount || '0',
      contractAddress: process.env.ACTIVITY_LOG_ADDRESS || null,
      logs: blockchainLogs
    },
    generatedAt: new Date().toISOString()
  };
}

async function generateReportPdf(batchId) {
  const report = await generateReport(batchId);
  const lines = [
    'FarmChain Product Verification Report',
    `Batch ID: ${report.batch.id}`,
    `Crop: ${report.batch.cropName} (${report.batch.variety || 'N/A'})`,
    `Category: ${report.batch.cropCategory}`,
    `Farm: ${report.farm.name}`,
    `Location PIN: ${report.farm.location.pinCode || 'N/A'}`,
    `State: ${report.batch.currentState}`,
    `AI Certification: ${report.aiCertification.status} (${report.aiCertification.score})`,
    `Third-party: ${report.thirdPartyCertification?.status || 'not requested'}`,
    `Trust Score: ${report.trustScore}`,
    `Blockchain Verified: ${report.blockchain.verified}`,
    `Blockchain Activity Count: ${report.blockchain.activityCount}`,
    '--- Timeline ---'
  ];

  report.timeline.slice(0, 20).forEach((item) => {
    lines.push(`${new Date(item.date).toLocaleDateString()} - ${item.type} - ${item.blockchainStatus}`);
  });

  lines.push('--- Blockchain Logs ---');
  if (report.blockchain.logs.length === 0) {
    lines.push('No blockchain logs');
  } else {
    report.blockchain.logs.slice(0, 10).forEach((log) => {
      lines.push(`${String(log.txHash).slice(0, 18)}... @ ${new Date(log.timestamp).toLocaleString()}`);
    });
  }

  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  return buildSimplePdfBuffer(lines);
}

module.exports = {
  generateReport,
  generateReportPdf
};
