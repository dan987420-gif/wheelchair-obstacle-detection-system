/**
 * @file thingspeakService.js
 * @brief ThingSpeak Cloud Integration Service (Read-Only Telemetry Ingestion)
 */

const http = require('http');
const https = require('https');
const config = require('../config');

/**
 * Maps ThingSpeak numeric risk code to system RiskLevel string label
 */
function mapRiskCode(val) {
  const num = parseInt(val, 10);
  switch (num) {
    case 0: return 'SAFE';
    case 1: return 'CAUTION';
    case 2: return 'WARNING';
    case 3: return 'CRITICAL';
    default: return 'SAFE';
  }
}

/**
 * Maps ThingSpeak numeric LED status to system LED string label
 */
function mapLedCode(val) {
  const num = parseInt(val, 10);
  switch (num) {
    case 1: return 'GREEN';
    case 2: return 'YELLOW';
    case 3: return 'YELLOW_BLINKING';
    case 4: return 'RED';
    default: return 'OFF';
  }
}

/**
 * Fetches feed JSON from ThingSpeak REST API
 */
function fetchThingSpeakFeeds(resultsCount = 30) {
  return new Promise((resolve, reject) => {
    const channelId = config.thingspeak?.channelId || 3519643;
    const readApiKey = config.thingspeak?.readApiKey || '';
    
    let url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?results=${resultsCount}`;
    if (readApiKey) {
      url += `&api_key=${readApiKey}`;
    }

    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, { timeout: 10000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const data = JSON.parse(body);
            resolve(data);
          } else {
            reject(new Error(`ThingSpeak HTTP ${res.statusCode}: ${body}`));
          }
        } catch (err) {
          reject(new Error(`Failed to parse ThingSpeak JSON response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('ThingSpeak request timed out after 10000ms'));
    });

  });
}

/**
 * Parses a raw ThingSpeak feed entry into standard telemetry format
 */
function parseFeedEntry(entry) {
  if (!entry) return null;

  const distanceCm = parseFloat(entry.field1);
  const validDistance = !isNaN(distanceCm) ? distanceCm : -1.0;
  const riskLevel = mapRiskCode(entry.field2);
  const buzzerActive = parseInt(entry.field3, 10) === 1;
  const ledState = mapLedCode(entry.field4);
  const vibrationActive = parseInt(entry.field5, 10) === 1;

  return {
    distanceCm: validDistance,
    riskLevel,
    sensorStatus: validDistance >= 0 ? 'OK' : 'ERROR',
    sensorType: 'HC-SR04',
    source: 'THINGSPEAK_CLOUD',
    deviceId: config.defaultDeviceId || 'WC-001',
    timestamp: entry.created_at || new Date().toISOString(),
    isOnline: true,
    rssi: -45,
    actuators: {
      buzzer: buzzerActive,
      vibration: vibrationActive,
      led: ledState
    },
    rawFeedId: entry.entry_id
  };
}

/**
 * Gets the latest normalized telemetry reading from ThingSpeak
 */
async function getLatestTelemetry() {
  try {
    const data = await fetchThingSpeakFeeds(1);
    if (data && Array.isArray(data.feeds) && data.feeds.length > 0) {
      const latestFeed = data.feeds[data.feeds.length - 1];
      const parsed = parseFeedEntry(latestFeed);
      return { success: true, data: parsed, channel: data.channel };
    }
    return {
      success: false,
      error: { code: 'NO_THINGSPEAK_DATA', message: 'No feeds returned from ThingSpeak Channel.' }
    };
  } catch (err) {
    return {
      success: false,
      error: { code: 'THINGSPEAK_FETCH_ERROR', message: err.message }
    };
  }
}

/**
 * Gets recent feeds formatted for live graph waveform history
 */
async function getRecentFeeds(limit = 60) {
  try {
    const data = await fetchThingSpeakFeeds(limit);
    if (data && Array.isArray(data.feeds)) {
      const parsedFeeds = data.feeds
        .map(parseFeedEntry)
        .filter(Boolean)
        .map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          distance: item.distanceCm,
          risk: item.riskLevel,
          timestamp: item.timestamp
        }));

      return { success: true, count: parsedFeeds.length, data: parsedFeeds, channel: data.channel };
    }
    return { success: true, count: 0, data: [] };
  } catch (err) {
    return {
      success: false,
      error: { code: 'THINGSPEAK_FETCH_ERROR', message: err.message }
    };
  }
}

module.exports = {
  fetchThingSpeakFeeds,
  parseFeedEntry,
  getLatestTelemetry,
  getRecentFeeds
};
