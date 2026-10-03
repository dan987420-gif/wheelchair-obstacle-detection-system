# Project Audit & Architecture Plan
**Project Title:** Wheelchair Obstacle Detection System  
**Date:** September 30, 2026  
**Auditor:** Antigravity Engineering Assistant  

---

## 1. Executive Summary
An inspection of the workspace (`c:\Users\Student\Downloads\New folder`) was conducted prior to code implementation. The directory is currently a greenfield/empty workspace. Node.js v20.18.0 and npm 10.8.2 are available in the local execution environment.

This audit establishes the technology stack, hardware-to-software architecture, communication protocols, and step-by-step implementation milestones to deliver a complete, college-level, demo-ready engineering project.

---

## 2. Existing Workspace Inventory
* **Frontend:** None existing (Greenfield).
* **Backend:** None existing (Greenfield).
* **Database:** None existing (Greenfield).
* **Hardware / Wokwi Files:** None existing (Greenfield).
* **Environment Files:** None existing (Greenfield).

---

## 3. Selected Technology Stack & Rationale

| Layer | Selected Technology | Rationale |
|---|---|---|
| **Hardware Controller** | ESP32 DevKit (Wokwi Simulation & Real Hardware Compatible) | Built-in Wi-Fi, dual-core processing, hardware timers, rich GPIOs for ultrasonic sensor, LEDs, buzzer, vibration motor, and I2C OLED display. |
| **Ultrasonic Sensor** | HC-SR04 (40kHz ultrasonic transceiver) | Standard 2cm - 400cm range, cost-effective, precise microsecond pulse measurement. |
| **Hardware Simulation** | Wokwi (`diagram.json`, `wokwi.toml`) | Accurate ESP32 + HC-SR04 + OLED + Actuators simulation in browser with real-time interactive distance tuning. |
| **Backend Runtime** | Node.js (v20) + Express.js | High-throughput, lightweight event-driven REST API server with low memory footprint. |
| **Real-time Transport** | WebSockets (`ws` library) + REST HTTP POST | Instantaneous bidirectional push (<10ms latency) to frontend dashboard upon hardware or simulation events. |
| **Embedded Database** | SQLite (`better-sqlite3` / `sqlite3`) | Self-contained, zero-configuration, robust relational persistence for readings, events, settings, and device status. |
| **Frontend Framework** | React 18 + Vite + Tailwind CSS / Vanilla CSS Design Tokens + Lucide Icons | Ultra-fast HMR, modular UI components, high-contrast accessible design system, live canvas charts. |
| **Testing** | Node.js Test Runner / Jest-compatible test suite | Comprehensive unit tests for risk classification, filtering, event grouping, API validation, and boundary conditions. |

---

## 4. Hardware Pin Mapping Specification

```text
=====================================================================
ESP32 DevKit GPIO Pin Assignment
=====================================================================
HC-SR04 Ultrasonic:
  - VCC       -> 5V / VIN
  - GND       -> GND
  - TRIG_PIN  -> GPIO 5   (Output: 10µs trigger pulse)
  - ECHO_PIN  -> GPIO 18  (Input: Echo duration measurement)

Local Actuators / Visual Feedback:
  - GREEN_LED -> GPIO 25  (Safe state indicator)
  - YELLOW_LED-> GPIO 26  (Caution / Warning state indicator)
  - RED_LED   -> GPIO 27  (Critical danger indicator)
  - BUZZER    -> GPIO 14  (PWM / non-blocking acoustic alarm)
  - VIBRATION -> GPIO 12  (Haptic / tactile vibration motor feedback)

I2C OLED Display (SSD1306 128x64):
  - SDA       -> GPIO 21
  - SCL       -> GPIO 22
=====================================================================
```

---

## 5. System Safety Architecture & Data Flow

```text
   +-------------------------------------------------------------+
   |                       WHEELCHAIR                            |
   |                                                             |
   |       +---------------------------------------------+       |
   |       |             HC-SR04 SENSOR                  |       |
   |       +----------------------+----------------------+       |
   |                              |                              |
   |                   Echo Pulse Duration (µs)                  |
   |                              v                              |
   |       +---------------------------------------------+       |
   |       |             ESP32 CONTROLLER                |       |
   |       | - Raw Distance = (time * 0.0343) / 2        |       |
   |       | - Noise Filtering (Moving Median/Average)   |       |
   |       | - Risk Classification + Hysteresis Engine   |       |
   |       +-------+--------------+---------------+------+       |
   |               |              |               |              |
   |        +------v-----+  +-----v------+  +-----v------+       |
   |        | Tri-Color  |  | Acoustic   |  | Haptic     |       |
   |        | LEDs       |  | Buzzer     |  | Vibration  |       |
   |        | (G/Y/R)    |  | Patterns   |  | Pulses     |       |
   |        +------------+  +------------+  +------------+       |
   |                      (Local Safety Loop:                    |
   |                    Works 100% Autonomous)                   |
   +------------------------------+------------------------------+
                                  |
                           Wi-Fi HTTP POST
                           JSON Protocol (v1.0)
                                  v
   +-------------------------------------------------------------+
   |                       BACKEND SERVER                        |
   | - REST API Endpoints (/api/v1/...)                          |
   | - Payload Validation & Sanitization                         |
   | - Continuous Obstacle Event Grouping & Lifecycles           |
   | - SQLite Persistent Storage (Readings, Events, Settings)    |
   | - WebSocket Broadcast Engine                                |
   +------------------------------+------------------------------+
                                  |
                           WebSocket Push
                                  v
   +-------------------------------------------------------------+
   |                     SOFTWARE DASHBOARD                      |
   | - Live Safety Monitor (Large distance display & danger HUD) |
   | - Real-Time Distance Waveform Graph                         |
   | - Obstacle Event History Log & CSV Export                   |
   | - Risk Analytics & Incident Distribution                    |
   | - Dynamic Safety Threshold Configuration                    |
   | - Interactive Software Simulation Mode (Fallback & Viva)    |
   +-------------------------------------------------------------+
```

---

## 6. Implementation Phases

1. **Phase 1:** Project Audit & Directory Structure Setup (Current)
2. **Phase 2:** Wokwi Hardware Simulation & Modular ESP32 Firmware (`diagram.json`, `wokwi.toml`, `libraries.txt`, `.ino` and modular `.h` managers)
3. **Phase 3:** Backend API & Persistence Engine (Express, SQLite schema, Event Aggregator, WebSocket Server)
4. **Phase 4:** Frontend Application (React + Vite + Modern Glassmorphism Safety HUD, Live Distance Graph, Event Tables, Settings, Simulation Mode)
5. **Phase 5:** End-to-End Testing & Unit Test Suite (Risk engine tests, hysteresis verification, API validation, simulated traffic)
6. **Phase 6:** Academic & Technical Documentation Suite (README, Report, Architecture, API, Hardware Pinouts, Viva Q&A, Demo Script)
7. **Phase 7:** Final Verification & Demo Validation Check
