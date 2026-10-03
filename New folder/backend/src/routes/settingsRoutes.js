const express = require('express');
const router = express.Router();
const db = require('../database');
const safetyEngine = require('../safetyEngine');
const wsManager = require('../websocket');

// GET /api/v1/settings
router.get('/', (req, res) => {
  const settings = db.getSettings();
  return res.json({ success: true, data: settings });
});

// PATCH /api/v1/settings
router.patch('/', (req, res) => {
  const current = db.getSettings();
  const merged = { ...current, ...req.body };
  
  const validation = safetyEngine.validateSettings(merged);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_SETTINGS', message: validation.error }
    });
  }

  const updated = db.updateSettings(validation.sanitized);

  // Broadcast settings change to all dashboard clients
  wsManager.broadcast('SETTINGS_UPDATE', updated);

  return res.json({
    success: true,
    message: 'Safety thresholds updated successfully.',
    data: updated
  });
});

module.exports = router;
