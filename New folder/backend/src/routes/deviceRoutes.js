const express = require('express');
const router = express.Router();
const db = require('../database');
const wsManager = require('../websocket');

// GET /api/v1/devices
router.get('/', (req, res) => {
  const devices = db.getDevices();
  return res.json({ success: true, count: devices.length, data: devices });
});

// GET /api/v1/devices/:id
router.get('/:id', (req, res) => {
  const device = db.getDeviceById(req.params.id);
  if (!device) {
    return res.status(404).json({
      success: false,
      error: { code: 'DEVICE_NOT_FOUND', message: `Device ${req.params.id} not found.` }
    });
  }
  return res.json({ success: true, data: device });
});

// POST /api/v1/devices/heartbeat
router.post('/heartbeat', (req, res) => {
  const { deviceId, sensorStatus, firmwareVersion, wifiRssi } = req.body;
  if (!deviceId) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_DEVICE_ID', message: 'deviceId is required' } });
  }

  const result = db.updateDeviceStatus(deviceId, {
    sensorStatus: sensorStatus || 'OK',
    firmwareVersion,
    wifiRssi
  });

  wsManager.broadcast('DEVICE_HEARTBEAT', result);

  return res.json({ success: true, message: 'Heartbeat acknowledged', data: result });
});

module.exports = router;
