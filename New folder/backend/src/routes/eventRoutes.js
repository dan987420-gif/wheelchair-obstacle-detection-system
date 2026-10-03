const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/v1/obstacle-events
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 100;
  const filters = {
    deviceId: req.query.deviceId,
    riskLevel: req.query.riskLevel,
    source: req.query.source,
    search: req.query.search
  };

  const events = db.getObstacleEvents(filters, limit);
  return res.json({ success: true, count: events.length, data: events });
});

// GET /api/v1/obstacle-events/export/csv
router.get('/export/csv', (req, res) => {
  const events = db.getObstacleEvents({}, 1000);
  
  const headers = ['Event ID', 'Device ID', 'Risk Level', 'Start Time', 'End Time', 'Duration (s)', 'Min Distance (cm)', 'Source', 'Status'];
  const rows = events.map(e => [
    e.id,
    `"${e.device_id}"`,
    `"${e.risk_level}"`,
    `"${e.start_time}"`,
    `"${e.end_time || 'ACTIVE'}"`,
    e.duration_seconds || 0,
    e.minimum_distance_cm,
    `"${e.source}"`,
    `"${e.is_active ? 'ACTIVE' : 'RESOLVED'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="wheelchair_obstacle_events.csv"');
  return res.status(200).send(csvContent);
});

// GET /api/v1/obstacle-events/:id
router.get('/:id', (req, res) => {
  const event = db.getObstacleEventById(req.params.id);
  if (!event) {
    return res.status(404).json({
      success: false,
      error: { code: 'EVENT_NOT_FOUND', message: `Obstacle event with ID ${req.params.id} not found.` }
    });
  }
  return res.json({ success: true, data: event });
});

module.exports = router;
