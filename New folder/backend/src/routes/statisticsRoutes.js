const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/statistics/overview
router.get('/overview', (req, res) => {
  const stats = db.getStatistics();
  return res.json({ success: true, data: stats });
});

// GET /api/v1/statistics/risk-distribution
router.get('/risk-distribution', (req, res) => {
  const stats = db.getStatistics();
  return res.json({ success: true, data: stats.riskDistribution });
});

// GET /api/v1/statistics/distance
router.get('/distance', (req, res) => {
  const readings = db.getReadings({}, 60);
  const data = readings.map(r => ({
    timestamp: r.recorded_at,
    distanceCm: r.distance_cm,
    riskLevel: r.risk_level
  }));
  return res.json({ success: true, count: data.length, data });
});

module.exports = router;
