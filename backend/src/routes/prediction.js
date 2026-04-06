const express = require('express');
const predictionService = require('../services/predictionService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const result = await predictionService.predict(req.body || {});
    return res.json({
      success: true,
      prediction: result
    });
  } catch (error) {
    console.error('Prediction API error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Prediction failed'
    });
  }
});

module.exports = router;
