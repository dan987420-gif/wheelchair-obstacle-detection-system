const http = require('http');
const express = require('express');
const cors = require('cors');
const config = require('./config');
const wsManager = require('./websocket');

// Import Route Handlers
const sensorRoutes = require('./routes/sensorRoutes');
const eventRoutes = require('./routes/eventRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  if (req.url !== '/api/v1/health') {
    console.log(`[HTTP] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/v1/sensor', sensorRoutes);
app.use('/api/v1/obstacle-events', eventRoutes);
app.use('/api/v1/statistics', statisticsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/simulation', simulationRoutes);
app.use('/api/v1/health', healthRoutes);

// Base Info Route
app.get('/', (req, res) => {
  res.json({
    project: 'Wheelchair Obstacle Detection System',
    tagline: 'Real-Time Ultrasonic Obstacle Detection and Multi-Modal Warning System for Wheelchair Assistance',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      telemetry: 'POST /api/v1/sensor/readings',
      events: '/api/v1/obstacle-events',
      statistics: '/api/v1/statistics/overview',
      settings: '/api/v1/settings',
      devices: '/api/v1/devices',
      simulation: '/api/v1/simulation/readings',
      websocket: 'ws://<host>:<port>/ws'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.url} does not exist.` }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: err.message || 'An unexpected server error occurred.' }
  });
});

// Initialize WebSockets
wsManager.init(server);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, config.host, () => {
    console.log(`=======================================================`);
    console.log(`  Wheelchair Obstacle Detection Server v1.0.0          `);
    console.log(`  HTTP Server: http://${config.host}:${config.port}   `);
    console.log(`  WebSocket  : ws://${config.host}:${config.port}/ws   `);
    console.log(`  Health API : http://${config.host}:${config.port}/api/v1/health`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };
