const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/health
router.get('/', (req, res) => {
  const devices = db.getDevices();
  const settings = db.getSettings();

  return res.json({
    status: 'ok',
    service: 'wheelchair-obstacle-detection-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: {
      status: 'connected',
      devicesCount: devices.length,
      settingsLoaded: !!settings
    }
  });
});

module.exports = router;
