# REST API & WebSocket Protocol Reference

**Base URL:** `http://localhost:5000/api/v1`  
**WebSocket URL:** `ws://localhost:5000/ws`  
**Protocol Version:** `1.0`

---

## 1. Health Endpoint

### `GET /api/v1/health`
Checks server uptime and database readiness.

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "wheelchair-obstacle-detection-backend",
  "version": "1.0.0",
  "timestamp": "2026-09-30T10:30:00.000Z",
  "uptimeSeconds": 124,
  "database": {
    "status": "connected",
    "devicesCount": 1,
    "settingsLoaded": true
  }
}
```

---

## 2. Sensor Telemetry Endpoints

### `POST /api/v1/sensor/readings`
Ingests telemetry sent by the ESP32 firmware or Wokwi simulator.

**Request Body:**
```json
{
  "protocolVersion": "1.0",
  "deviceId": "WC-001",
  "sensorType": "HC-SR04",
  "distanceCm": 42.5,
  "riskLevel": "CRITICAL",
  "sensorStatus": "OK",
  "buzzer": true,
  "vibration": true,
  "led": "RED",
  "source": "WOKWI",
  "firmwareVersion": "1.0.0",
  "wifiRssi": -48
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "reading": {
      "id": 104,
      "device_id": "WC-001",
      "distance_cm": 42.5,
      "risk_level": "CRITICAL",
      "source": "WOKWI",
      "recorded_at": "2026-09-30T10:30:00.120Z"
    },
    "calculatedRisk": "CRITICAL",
    "eventState": "ACTIVE_INCIDENT"
  }
}
```

### `GET /api/v1/sensor/readings`
Queries sensor telemetry history.

**Query Parameters:**
* `limit` (optional, default: 50)
* `deviceId` (optional)
* `riskLevel` (optional)
* `source` (optional)

### `GET /api/v1/sensor/readings/latest`
Returns the most recent distance reading for the specified device.

---

## 3. Obstacle Incident Events

### `GET /api/v1/obstacle-events`
Retrieves grouped obstacle encounters.

**Query Parameters:**
* `search` (optional)
* `riskLevel` (optional)
* `source` (optional)
* `limit` (optional)

### `GET /api/v1/obstacle-events/export/csv`
Streams a formatted `.csv` file containing all obstacle incidents.

---

## 4. Safety Threshold Settings

### `GET /api/v1/settings`
Retrieves current threshold contract.

### `PATCH /api/v1/settings`
Updates safety thresholds with strict validation rules.

**Request Body:**
```json
{
  "safeDistanceCm": 150.0,
  "cautionDistanceCm": 100.0,
  "warningDistanceCm": 50.0,
  "criticalDistanceCm": 30.0,
  "hysteresisCm": 4.0
}
```

---

## 5. Software Simulation Fallback

### `POST /api/v1/simulation/readings`
Submits simulated distance value directly from UI sliders or preset viva buttons.

**Request Body:**
```json
{
  "distanceCm": 30.0,
  "deviceId": "WC-001"
}
```

### `POST /api/v1/simulation/start`
Initiates an automated dynamic approaching/retreating obstacle test sequence.

### `POST /api/v1/simulation/stop`
Stops automated test sequence.

---

## 6. WebSocket Protocol (`/ws`)

Clients connecting to `ws://localhost:5000/ws` receive JSON event frames:

```json
{
  "type": "SENSOR_READING",
  "data": {
    "reading": {
      "id": 152,
      "device_id": "WC-001",
      "distance_cm": 74.2,
      "risk_level": "WARNING",
      "source": "WOKWI"
    },
    "status": {
      "buzzer_status": true,
      "vibration_status": true,
      "led_status": "YELLOW_BLINKING"
    }
  },
  "timestamp": "2026-09-30T10:30:01.000Z"
}
```
