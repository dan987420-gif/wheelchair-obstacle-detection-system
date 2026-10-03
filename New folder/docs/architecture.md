# System Architecture & Technical Specifications

**Project Title:** Wheelchair Obstacle Detection System  
**Tagline:** Real-Time Ultrasonic Obstacle Detection and Multi-Modal Warning System for Wheelchair Assistance  

---

## 1. High-Level Architecture Diagram

```text
                  +-----------------------------------+
                  |         HC-SR04 SENSOR            |
                  | 40kHz Ultrasonic Distance Meter   |
                  +-----------------+-----------------+
                                    | Echo Pulse (µs)
                                    v
                  +-----------------------------------+
                  |       ESP32 MICROCONTROLLER       |
                  | - 10µs Trigger Pulse Generation   |
                  | - Raw Distance Calculation        |
                  | - 5-Sample Median Noise Filter    |
                  | - 4-Tier Risk Engine + Hysteresis |
                  | - Local Non-Blocking Actuators    |
                  +--------+--------+--------+--------+
                           |        |        |
         +-----------------+        |        +-----------------+
         |                          |                          |
         v                          v                          v
+-----------------+        +-----------------+        +-----------------+
| Tri-Color LEDs  |        |  Piezo Buzzer   |        | Vibration Motor |
| Green / Yellow  |        | Acoustic Alarm  |        | Haptic Feedback |
| Red Emergency   |        | (Slow/Med/Fast) |        | Tactile Alert   |
+-----------------+        +-----------------+        +-----------------+
         |                          |                          |
         +--------------------------+--------------------------+
                                    |
                          Local SSD1306 OLED HUD
                                    |
                             Wi-Fi HTTP POST
                           JSON Protocol (v1.0)
                                    v
                  +-----------------------------------+
                  |        BACKEND REST SERVER        |
                  | - Express.js API Ingestion Gateway|
                  | - Schema Sanitization & Validation|
                  | - Obstacle Incident Deduplication |
                  | - Device Heartbeat & Health Check |
                  +-----------------+-----------------+
                                    |
                       +------------+------------+
                       |                         |
                       v                         v
        +----------------------------+   +-----------------------------+
        |      SQLITE DATABASE       |   |      WEBSOCKET SERVER       |
        | - Table: sensor_readings   |   | - Low-latency Broadcast     |
        | - Table: obstacle_events   |   | - JSON Telemetry Stream     |
        | - Table: system_settings   |   | - Bi-directional Sync       |
        | - Table: device_status     |   +--------------+--------------+
        +----------------------------+                  |
                                                        v
                                         +-----------------------------+
                                         |     REACT DASHBOARD HUD     |
                                         | - Proximity Gauge (0-250cm) |
                                         | - 60fps Waveform Chart      |
                                         | - Obstacle Incident Log     |
                                         | - Safety Threshold Sliders  |
                                         | - Software Simulation Rig   |
                                         +-----------------------------+
```

---

## 2. Risk Classification Engine & State Machine

```mermaid
stateDiagram-v2
    [*] --> SAFE: Distance > 150 cm

    SAFE --> CAUTION: Distance <= 150 cm
    CAUTION --> WARNING: Distance <= 100 cm
    WARNING --> CRITICAL: Distance <= 50 cm

    CRITICAL --> WARNING: Distance > 54 cm (Critical + 4cm Hysteresis)
    WARNING --> CAUTION: Distance > 104 cm (Warning + 4cm Hysteresis)
    CAUTION --> SAFE: Distance > 154 cm (Caution + 4cm Hysteresis)

    SAFE --> CRITICAL: Sudden Proximity Breach (<= 50 cm)
    CRITICAL --> SAFE: Rapid Clear (> 154 cm)
```

---

## 3. Autonomous Safety Loop vs Monitoring Cloud

A fundamental engineering design principle of this project is the **absolute separation between local hardware safety and remote software monitoring**:

1. **Hardware Independence:** The ESP32 local safety loop operates 100% autonomously in bare-metal C++. Even if the Wi-Fi router disconnects, backend crashes, or frontend browser is closed, the HC-SR04, LEDs, Buzzer, and Vibration motor respond instantaneously (&lt;10ms) to physical obstacles.
2. **Software Monitoring:** The backend, SQLite database, and React dashboard serve as an observational, analytical, and supervisory telemetry layer for attendants, clinicians, and researchers.

---

## 4. Database Schema (Entity-Relationship)

```mermaid
erDiagram
    DEVICES ||--o{ SENSOR_READINGS : records
    DEVICES ||--o{ OBSTACLE_EVENTS : triggers
    DEVICES ||--|| DEVICE_STATUS : tracks

    DEVICES {
        int id PK
        string device_id UK
        string name
        string location
        string firmware_version
        string status
        datetime last_seen
        datetime created_at
    }

    SENSOR_READINGS {
        int id PK
        string device_id FK
        string sensor_type
        float distance_cm
        string risk_level
        string source
        datetime recorded_at
    }

    OBSTACLE_EVENTS {
        int id PK
        string device_id FK
        string risk_level
        datetime start_time
        datetime end_time
        int duration_seconds
        float minimum_distance_cm
        string source
        boolean is_active
    }

    SYSTEM_SETTINGS {
        int id PK
        float safe_distance_cm
        float caution_distance_cm
        float warning_distance_cm
        float critical_distance_cm
        float hysteresis_cm
        datetime updated_at
    }
```
