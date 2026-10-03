const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  dataFilePath: path.resolve(__dirname, process.env.DATA_FILE_PATH || '../../database/wheelchair_storage.json'),
  heartbeatTimeoutMs: parseInt(process.env.DEVICE_HEARTBEAT_TIMEOUT_MS, 10) || 15000,
  defaultDeviceId: process.env.DEFAULT_DEVICE_ID || 'WC-001',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Default Centralized Safety Configuration Contract
  defaultThresholds: {
    safeDistanceCm: 150.0,
    cautionDistanceCm: 100.0,
    warningDistanceCm: 50.0,
    criticalDistanceCm: 30.0,
    hysteresisCm: 4.0,
    sensorTimeoutMs: 3000,
    heartbeatIntervalMs: 5000,
    maxReadingsRetained: 2000
  }
};
