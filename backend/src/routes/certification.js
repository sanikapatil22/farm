const express = require('express');
const certificationService = require('../services/certificationService');

const router = express.Router();

router.post('/request', async (req, res) => {
  try {
    const { batchId, authority } = req.body || {};
    const record = await certificationService.requestCertification({ batchId, authority: authority || 'NPOP' });

    return res.json({
      success: true,
      certification: {
        batchId: String(record.batchId),
        authority: record.authority,
        status: record.status,
        certificateId: record.certificateId,
        issuedAt: record.issuedAt,
        expiresAt: record.expiresAt,
        reportUrl: record.reportUrl
      }
    });
  } catch (error) {
    console.error('Certification request API error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to request certification'
    });
  }
});

router.get('/:batchId', async (req, res) => {
  try {
    const data = await certificationService.getCertification(req.params.batchId);
    return res.json(data);
  } catch (error) {
    console.error('Certification fetch API error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch certification'
    });
  }
});

module.exports = router;
