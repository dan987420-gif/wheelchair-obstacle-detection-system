const express = require('express');
const router = express.Router();
const db = require('../database');
const safetyEngine = require('../safetyEngine');
const eventManager = require('../eventManager');
const wsManager = require('../websocket');

// POST /api/v1/sensor/readings
// Primary ingestion endpoint for ESP32 / Wokwi / Real Hardware
router.post('/readings', (req, res) => {
  const validation = safetyEngine.validateReading(req.body);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SENSOR_PAYLOAD', message: validation.error }
    });
  }

  const { deviceId, sensorType, distanceCm, source, buzzer, vibration, led, sensorStatus, firmwareVersion, wifiRssi } = req.body;
  const dist = validation.sanitizedDistance;

  // Recalculate and verify risk level according to server safety engine
  const calculatedRisk = safetyEngine.calculateRisk(dist);

  // Persist reading
  const reading = db.saveReading({
    deviceId,
    sensorType: sensorType || 'HC-SR04',
    distanceCm: dist,
    riskLevel: calculatedRisk,
    source: source || 'WOKWI',
    timestamp: req.body.timestamp || new Date().toISOString()
  });

  // Update device status & heartbeat
  const deviceStatus = db.updateDeviceStatus(deviceId, {
    sensorStatus: sensorStatus || (dist < 0 ? 'ERROR' : 'OK'),
    buzzer,
    vibration,
    led,
    firmwareVersion,
    wifiRssi
  });

  // Process obstacle incident lifecycle
  const eventChange = eventManager.processReadingEvent(deviceId, dist, calculatedRisk, source || 'WOKWI');

  // Broadcast real-time update via WebSocket
  wsManager.broadcast('SENSOR_READING', {
    reading,
    device: deviceStatus.device,
    status: deviceStatus.status,
    eventChange
  });

  return res.status(201).json({
    success: true,
    data: {
      reading,
      calculatedRisk,
      eventState: eventChange ? (eventChange.is_active ? 'ACTIVE_INCIDENT' : 'INCIDENT_CLEARED') : 'NO_CHANGE'
    }
  });
});

// GET /api/v1/sensor/readings
router.get('/readings', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const filters = {
    deviceId: req.query.deviceId,
    riskLevel: req.query.riskLevel,
    source: req.query.source
  };
  const readings = db.getReadings(filters, limit);
  return res.json({ success: true, count: readings.length, data: readings });
});

const thingspeakService = require('../services/thingspeakService');

// GET /api/v1/sensor/readings/latest
router.get('/readings/latest', (req, res) => {
  const reading = db.getLatestReading(req.query.deviceId);
  if (!reading) {
    return res.status(404).json({
      success: false,
      error: { code: 'NO_READINGS_FOUND', message: 'No sensor telemetry available.' }
    });
  }
  return res.json({ success: true, data: reading });
});

// GET /api/v1/sensor/thingspeak/latest
router.get('/thingspeak/latest', async (req, res) => {
  const result = await thingspeakService.getLatestTelemetry();
  if (!result.success) {
    return res.status(502).json(result);
  }
  return res.json(result);
});

// GET /api/v1/sensor/thingspeak/feeds
router.get('/thingspeak/feeds', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 60;
  const result = await thingspeakService.getRecentFeeds(limit);
  if (!result.success) {
    return res.status(502).json(result);
  }
  return res.json(result);
});

module.exports = router;

