const express = require('express');
const router = express.Router();
const db = require('../database');
const safetyEngine = require('../safetyEngine');
const eventManager = require('../eventManager');
const wsManager = require('../websocket');

let simulationActive = false;
let simulationInterval = null;

// POST /api/v1/simulation/readings
// Manual simulation trigger from dashboard slider or preset buttons
router.post('/readings', (req, res) => {
  const { distanceCm, deviceId } = req.body;
  const targetDevice = deviceId || 'WC-001';

  const dist = Number(distanceCm);
  if (isNaN(dist) || dist < -1 || dist > 1000) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SIMULATION_DISTANCE', message: 'Distance must be between -1 and 1000 cm' }
    });
  }

  const roundedDist = dist >= 0 ? Math.round(dist * 10) / 10 : -1;
  const calculatedRisk = safetyEngine.calculateRisk(roundedDist);

  // Compute simulated hardware actuator states
  const buzzer = calculatedRisk === 'WARNING' || calculatedRisk === 'CRITICAL';
  const vibration = calculatedRisk === 'CAUTION' || calculatedRisk === 'WARNING' || calculatedRisk === 'CRITICAL';
  let led = 'GREEN';
  if (calculatedRisk === 'CAUTION') led = 'YELLOW';
  if (calculatedRisk === 'WARNING') led = 'YELLOW_BLINKING';
  if (calculatedRisk === 'CRITICAL') led = 'RED';

  const reading = db.saveReading({
    deviceId: targetDevice,
    sensorType: 'HC-SR04_SIMULATOR',
    distanceCm: roundedDist,
    riskLevel: calculatedRisk,
    source: 'SOFTWARE_SIMULATION',
    timestamp: new Date().toISOString()
  });

  const deviceStatus = db.updateDeviceStatus(targetDevice, {
    sensorStatus: roundedDist < 0 ? 'ERROR' : 'OK',
    buzzer,
    vibration,
    led,
    firmwareVersion: '1.0.0-sim',
    wifiRssi: -42
  });

  const eventChange = eventManager.processReadingEvent(targetDevice, roundedDist, calculatedRisk, 'SOFTWARE_SIMULATION');

  wsManager.broadcast('SENSOR_READING', {
    reading,
    device: deviceStatus.device,
    status: deviceStatus.status,
    eventChange
  });

  return res.json({
    success: true,
    data: {
      reading,
      calculatedRisk,
      actuators: { buzzer, vibration, led },
      eventState: eventChange ? (eventChange.is_active ? 'ACTIVE' : 'RESOLVED') : 'NONE'
    }
  });
});

// POST /api/v1/simulation/start
router.post('/start', (req, res) => {
  if (simulationActive) {
    return res.json({ success: true, message: 'Simulation already running.' });
  }

  simulationActive = true;
  let simulatedDist = 220;
  let step = -15;

  simulationInterval = setInterval(() => {
    if (!simulationActive) {
      clearInterval(simulationInterval);
      return;
    }

    simulatedDist += step;
    if (simulatedDist <= 25) {
      simulatedDist = 25;
      step = 15; // Bounce back
    } else if (simulatedDist >= 220) {
      simulatedDist = 220;
      step = -15; // Reverse towards obstacle
    }

    const calculatedRisk = safetyEngine.calculateRisk(simulatedDist);
    const buzzer = calculatedRisk === 'WARNING' || calculatedRisk === 'CRITICAL';
    const vibration = calculatedRisk === 'CAUTION' || calculatedRisk === 'WARNING' || calculatedRisk === 'CRITICAL';
    let led = 'GREEN';
    if (calculatedRisk === 'CAUTION') led = 'YELLOW';
    if (calculatedRisk === 'WARNING') led = 'YELLOW_BLINKING';
    if (calculatedRisk === 'CRITICAL') led = 'RED';

    const reading = db.saveReading({
      deviceId: 'WC-001',
      sensorType: 'HC-SR04_AUTO_SIM',
      distanceCm: Math.round(simulatedDist * 10) / 10,
      riskLevel: calculatedRisk,
      source: 'SOFTWARE_SIMULATION',
      timestamp: new Date().toISOString()
    });

    const deviceStatus = db.updateDeviceStatus('WC-001', {
      sensorStatus: 'OK',
      buzzer,
      vibration,
      led,
      firmwareVersion: '1.0.0-sim',
      wifiRssi: -40
    });

    const eventChange = eventManager.processReadingEvent('WC-001', simulatedDist, calculatedRisk, 'SOFTWARE_SIMULATION');

    wsManager.broadcast('SENSOR_READING', {
      reading,
      device: deviceStatus.device,
      status: deviceStatus.status,
      eventChange
    });
  }, 1000);

  return res.json({ success: true, message: 'Auto dynamic obstacle simulation sequence started.' });
});

// POST /api/v1/simulation/stop
router.post('/stop', (req, res) => {
  simulationActive = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  return res.json({ success: true, message: 'Auto simulation stopped.' });
});

module.exports = router;
