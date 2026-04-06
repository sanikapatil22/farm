const express = require('express');
const reportService = require('../services/reportService');

const router = express.Router();

router.get('/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const wantPdf = req.query.download === 'true' || req.query.format === 'pdf';

    if (wantPdf) {
      const pdfBuffer = await reportService.generateReportPdf(batchId);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="batch-report-${batchId}.pdf"`);
      return res.send(pdfBuffer);
    }

    const report = await reportService.generateReport(batchId);
    return res.json(report);
  } catch (error) {
    console.error('Report API error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

module.exports = router;
