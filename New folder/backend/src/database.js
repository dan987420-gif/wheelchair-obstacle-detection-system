const fs = require('fs');
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.filePath = config.dataFilePath;
    this.data = {
      devices: [],
      sensor_readings: [],
      obstacle_events: [],
      system_settings: { ...config.defaultThresholds, id: 1, updated_at: new Date().toISOString() },
      device_status: []
    };
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          devices: parsed.devices || [],
          sensor_readings: parsed.sensor_readings || [],
          obstacle_events: parsed.obstacle_events || [],
          system_settings: parsed.system_settings || { ...config.defaultThresholds, id: 1, updated_at: new Date().toISOString() },
          device_status: parsed.device_status || []
        };
      } else {
        this.seedDefaults();
        this.saveToFile();
      }
    } catch (err) {
      console.error('[DB] Error initializing database file:', err.message);
      this.seedDefaults();
    }
  }

  seedDefaults() {
    const now = new Date().toISOString();
    this.data.devices = [
      {
        id: 1,
        device_id: 'WC-001',
        name: 'Wheelchair Prototype Alpha',
        location: 'Lab Test Rig',
        firmware_version: '1.0.0',
        status: 'OFFLINE',
        last_seen: null,
        created_at: now,
        updated_at: now
      }
    ];

    this.data.device_status = [
      {
        id: 1,
        device_id: 'WC-001',
        sensor_status: 'UNKNOWN',
        buzzer_status: false,
        vibration_status: false,
        led_status: 'OFF',
        wifi_rssi: 0,
        last_seen: null
      }
    ];
  }

  saveToFile() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DB] Error writing to storage file:', err.message);
    }
  }

  // ==========================================
  // SYSTEM SETTINGS
  // ==========================================
  getSettings() {
    return { ...this.data.system_settings };
  }

  updateSettings(updates) {
    this.data.system_settings = {
      ...this.data.system_settings,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveToFile();
    return this.getSettings();
  }

  // ==========================================
  // SENSOR READINGS
  // ==========================================
  saveReading(reading) {
    const entry = {
      id: this.data.sensor_readings.length + 1,
      device_id: reading.deviceId || 'WC-001',
      sensor_type: reading.sensorType || 'HC-SR04',
      distance_cm: typeof reading.distanceCm === 'number' ? Math.round(reading.distanceCm * 10) / 10 : null,
      risk_level: reading.riskLevel || 'UNKNOWN',
      source: reading.source || 'WOKWI',
      recorded_at: reading.timestamp ? new Date(reading.timestamp).toISOString() : new Date().toISOString()
    };

    this.data.sensor_readings.push(entry);

    // Retention policy: Keep the latest maxReadingsRetained items to prevent unbounded memory growth
    const maxRetained = this.data.system_settings.maxReadingsRetained || 2000;
    if (this.data.sensor_readings.length > maxRetained) {
      this.data.sensor_readings.splice(0, this.data.sensor_readings.length - maxRetained);
    }

    this.saveToFile();
    return entry;
  }

  getReadings(filters = {}, limit = 50) {
    let results = [...this.data.sensor_readings];

    if (filters.deviceId) {
      results = results.filter(r => r.device_id === filters.deviceId);
    }
    if (filters.riskLevel) {
      results = results.filter(r => r.risk_level === filters.riskLevel);
    }
    if (filters.source) {
      results = results.filter(r => r.source === filters.source);
    }

    // Return in reverse chronological order (newest first)
    results.reverse();
    return results.slice(0, limit);
  }

  getLatestReading(deviceId = null) {
    if (this.data.sensor_readings.length === 0) return null;
    if (!deviceId) return this.data.sensor_readings[this.data.sensor_readings.length - 1];

    for (let i = this.data.sensor_readings.length - 1; i >= 0; i--) {
      if (this.data.sensor_readings[i].device_id === deviceId) {
        return this.data.sensor_readings[i];
      }
    }
    return null;
  }

  // ==========================================
  // OBSTACLE EVENTS
  // ==========================================
  startObstacleEvent(eventData) {
    const newEvent = {
      id: this.data.obstacle_events.length + 1,
      device_id: eventData.deviceId || 'WC-001',
      risk_level: eventData.riskLevel,
      start_time: eventData.startTime || new Date().toISOString(),
      end_time: null,
      duration_seconds: 0,
      minimum_distance_cm: eventData.distanceCm,
      source: eventData.source || 'WOKWI',
      is_active: true,
      created_at: new Date().toISOString()
    };

    this.data.obstacle_events.push(newEvent);
    this.saveToFile();
    return newEvent;
  }

  getActiveObstacleEvent(deviceId) {
    for (let i = this.data.obstacle_events.length - 1; i >= 0; i--) {
      const ev = this.data.obstacle_events[i];
      if (ev.device_id === deviceId && ev.is_active) {
        return ev;
      }
    }
    return null;
  }

  updateActiveObstacleEvent(id, updates) {
    const ev = this.data.obstacle_events.find(e => e.id === id);
    if (!ev) return null;

    if (updates.distanceCm !== undefined && updates.distanceCm < ev.minimum_distance_cm) {
      ev.minimum_distance_cm = Math.round(updates.distanceCm * 10) / 10;
    }

    // Elevate risk level if new level is more critical
    const riskPriority = { 'SAFE': 0, 'CAUTION': 1, 'WARNING': 2, 'CRITICAL': 3 };
    if (updates.riskLevel && riskPriority[updates.riskLevel] > riskPriority[ev.risk_level]) {
      ev.risk_level = updates.riskLevel;
    }

    this.saveToFile();
    return ev;
  }

  closeObstacleEvent(id, endTime = new Date().toISOString()) {
    const ev = this.data.obstacle_events.find(e => e.id === id);
    if (!ev || !ev.is_active) return null;

    ev.end_time = endTime;
    ev.is_active = false;
    const startMs = new Date(ev.start_time).getTime();
    const endMs = new Date(endTime).getTime();
    ev.duration_seconds = Math.max(1, Math.round((endMs - startMs) / 1000));

    this.saveToFile();
    return ev;
  }

  getObstacleEvents(filters = {}, limit = 50) {
    let results = [...this.data.obstacle_events];

    if (filters.deviceId) {
      results = results.filter(e => e.device_id === filters.deviceId);
    }
    if (filters.riskLevel) {
      results = results.filter(e => e.risk_level === filters.riskLevel);
    }
    if (filters.source) {
      results = results.filter(e => e.source === filters.source);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(e => 
        e.device_id.toLowerCase().includes(q) || 
        e.risk_level.toLowerCase().includes(q) ||
        (e.source && e.source.toLowerCase().includes(q))
      );
    }

    // Return newest first
    results.reverse();
    return results.slice(0, limit);
  }

  getObstacleEventById(id) {
    return this.data.obstacle_events.find(e => e.id === parseInt(id, 10)) || null;
  }

  // ==========================================
  // DEVICES & STATUS
  // ==========================================
  getDevices() {
    return this.data.devices.map(dev => {
      const status = this.data.device_status.find(s => s.device_id === dev.device_id) || {};
      const isOnline = status.last_seen && (Date.now() - new Date(status.last_seen).getTime() < config.heartbeatTimeoutMs);
      return {
        ...dev,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        device_status: status
      };
    });
  }

  getDeviceById(deviceId) {
    const dev = this.data.devices.find(d => d.device_id === deviceId);
    if (!dev) return null;
    const status = this.data.device_status.find(s => s.device_id === deviceId) || {};
    const isOnline = status.last_seen && (Date.now() - new Date(status.last_seen).getTime() < config.heartbeatTimeoutMs);
    return {
      ...dev,
      status: isOnline ? 'ONLINE' : 'OFFLINE',
      device_status: status
    };
  }

  updateDeviceStatus(deviceId, statusUpdate) {
    const now = new Date().toISOString();
    let dev = this.data.devices.find(d => d.device_id === deviceId);
    if (!dev) {
      dev = {
        id: this.data.devices.length + 1,
        device_id: deviceId,
        name: `Wheelchair Device ${deviceId}`,
        location: 'Operational Area',
        firmware_version: statusUpdate.firmwareVersion || '1.0.0',
        status: 'ONLINE',
        last_seen: now,
        created_at: now,
        updated_at: now
      };
      this.data.devices.push(dev);
    } else {
      dev.last_seen = now;
      dev.updated_at = now;
      if (statusUpdate.firmwareVersion) dev.firmware_version = statusUpdate.firmwareVersion;
    }

    let status = this.data.device_status.find(s => s.device_id === deviceId);
    if (!status) {
      status = {
        id: this.data.device_status.length + 1,
        device_id: deviceId,
        sensor_status: statusUpdate.sensorStatus || 'OK',
        buzzer_status: !!statusUpdate.buzzer,
        vibration_status: !!statusUpdate.vibration,
        led_status: statusUpdate.led || 'GREEN',
        wifi_rssi: statusUpdate.wifiRssi || 0,
        last_seen: now
      };
      this.data.device_status.push(status);
    } else {
      status.sensor_status = statusUpdate.sensorStatus || status.sensor_status;
      status.buzzer_status = statusUpdate.buzzer !== undefined ? !!statusUpdate.buzzer : status.buzzer_status;
      status.vibration_status = statusUpdate.vibration !== undefined ? !!statusUpdate.vibration : status.vibration_status;
      status.led_status = statusUpdate.led || status.led_status;
      status.wifi_rssi = statusUpdate.wifiRssi !== undefined ? statusUpdate.wifiRssi : status.wifi_rssi;
      status.last_seen = now;
    }

    this.saveToFile();
    return { device: dev, status };
  }

  // ==========================================
  // STATISTICS & ANALYTICS
  // ==========================================
  getStatistics() {
    const events = this.data.obstacle_events;
    const readings = this.data.sensor_readings;

    const totalEvents = events.length;
    const criticalEvents = events.filter(e => e.risk_level === 'CRITICAL').length;
    const warningEvents = events.filter(e => e.risk_level === 'WARNING').length;
    const cautionEvents = events.filter(e => e.risk_level === 'CAUTION').length;

    let avgMinDistance = 0;
    let avgDuration = 0;

    if (totalEvents > 0) {
      const sumDist = events.reduce((acc, curr) => acc + (curr.minimum_distance_cm || 0), 0);
      avgMinDistance = Math.round((sumDist / totalEvents) * 10) / 10;

      const sumDuration = events.reduce((acc, curr) => acc + (curr.duration_seconds || 1), 0);
      avgDuration = Math.round((sumDuration / totalEvents) * 10) / 10;
    }

    const latest = readings.length > 0 ? readings[readings.length - 1] : null;

    return {
      totalEvents,
      criticalEvents,
      warningEvents,
      cautionEvents,
      avgMinDistanceCm: avgMinDistance,
      avgDurationSeconds: avgDuration,
      totalReadingsRecorded: readings.length,
      currentDistanceCm: latest ? latest.distance_cm : null,
      currentRiskLevel: latest ? latest.risk_level : 'SAFE',
      riskDistribution: {
        SAFE: readings.filter(r => r.risk_level === 'SAFE').length,
        CAUTION: cautionEvents + readings.filter(r => r.risk_level === 'CAUTION').length,
        WARNING: warningEvents + readings.filter(r => r.risk_level === 'WARNING').length,
        CRITICAL: criticalEvents + readings.filter(r => r.risk_level === 'CRITICAL').length
      }
    };
  }
}

module.exports = new Database();
