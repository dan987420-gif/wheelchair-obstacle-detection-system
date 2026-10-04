/**
 * @file sketch.ino
 * @brief Wheelchair Obstacle Detection System - Main Firmware
 * @author Senior Embedded Systems & IoT Engineering Team
 *
 * Hardware Platform: ESP32 DevKit + HC-SR04 + OLED + Visual/Acoustic/Haptic Actuators
 *
 * Architecture Principle:
 *   Autonomous Local Safety Loop (100% active even if Network/Backend is Offline)
 *   Integrated IoT Telemetry Stream (JSON Lines over Serial & REST HTTP POST)
 */

#include "config.h"
#include "safety_manager.h"
#include "actuator_manager.h"
#include "communication_manager.h"
#include "sensor_manager.h"

// System Module Instances
SensorManager sensorMgr;
SafetyManager safetyMgr;
ActuatorManager actuatorMgr;
CommunicationManager commMgr;

// Non-blocking loop timing state
unsigned long lastSensorReadTime = 0;
unsigned long lastTelemetryTime = 0;
unsigned long lastHeartbeatTime = 0;
RiskLevel previousRiskLevel = RISK_SAFE;
float currentFilteredDist = 200.0f;

void setup() {
  // 1. Initialize Serial Communication for structured debug & data streaming
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n=================================================="));
  Serial.println(F("     WHEELCHAIR OBSTACLE DETECTION SYSTEM         "));
  Serial.println(F("   Real-Time Ultrasonic Safety Firmware v1.0.0    "));
  Serial.print(F("   Device Identifier: "));
  Serial.println(DEVICE_ID);
  Serial.println(F("=================================================="));

  // 2. Initialize Hardware Subsystems
  Serial.println(F("DEBUG:Initializing HC-SR04 ultrasonic sensor..."));
  sensorMgr.begin();

  Serial.println(F("DEBUG:Initializing multi-modal alert actuators & OLED..."));
  actuatorMgr.begin();

  // 3. Run Hardware Self-Test (LEDs, Buzzer, Vibration)
  Serial.println(F("DEBUG:Running hardware self-test..."));
  actuatorMgr.runSelfTest();

  // 4. Initialize Network Subsystem (Non-blocking background connection)
  commMgr.begin();

  Serial.println(
      F("DEBUG:System initialization complete. Entering safety loop.\n"));
}

void loop() {
  unsigned long now = millis();

  // -------------------------------------------------------------
  // 1. PERIODIC SENSOR SAMPLING & FILTERING (Every 100ms)
  // -------------------------------------------------------------
  if (now - lastSensorReadTime >= SENSOR_READ_INTERVAL_MS) {
    lastSensorReadTime = now;

    // Read distance through circular-buffer noise filter
    currentFilteredDist = sensorMgr.getFilteredDistance();

    // Evaluate risk level with hysteresis dampening
    RiskLevel currentRisk = safetyMgr.calculateRisk(currentFilteredDist);

    // If a risk transition occurs (e.g. SAFE -> CRITICAL), trigger immediate telemetry
    if (currentRisk != previousRiskLevel) {
      commMgr.printSerialData(
          currentFilteredDist, currentRisk, sensorMgr.getStatusString(),
          actuatorMgr.getBuzzerActive(), actuatorMgr.getVibrationActive(),
          actuatorMgr.getActiveLed(currentRisk));

      // Immediate priority transmission to backend
      commMgr.sendTelemetry(
          currentFilteredDist, currentRisk, sensorMgr.getStatusString(),
          actuatorMgr.getBuzzerActive(), actuatorMgr.getVibrationActive(),
          actuatorMgr.getActiveLed(currentRisk));

      previousRiskLevel = currentRisk;
    }

    // Send sensor data to ThingSpeak
    int riskValue = 0;
    int ledStatus = 0;

    switch (currentRisk) {
    case RISK_SAFE:
      riskValue = 0;
      ledStatus = 1;
      break;

    case RISK_CAUTION:
      riskValue = 1;
      ledStatus = 2;
      break;

    case RISK_WARNING:
      riskValue = 2;
      ledStatus = 3;
      break;

    case RISK_CRITICAL:
      riskValue = 3;
      ledStatus = 4;
      break;

    default:
      riskValue = 0;
      ledStatus = 0;
      break;
    }

    commMgr.sendToThingSpeak(currentFilteredDist, riskValue,
                             actuatorMgr.getBuzzerActive(),
                             actuatorMgr.getVibrationActive(), ledStatus);
  }

  // -------------------------------------------------------------
  // 2. LOCAL SAFETY ACTUATION LOOP (Continuous, Non-Blocking)
  // -------------------------------------------------------------
  RiskLevel activeRisk = safetyMgr.getCurrentRisk();
  actuatorMgr.update(activeRisk, currentFilteredDist,
                     sensorMgr.getStatusString(), now);

  // -------------------------------------------------------------
  // 3. BACKGROUND NETWORK CONNECTIVITY CHECK
  // -------------------------------------------------------------
  commMgr.checkConnection(now);

  // -------------------------------------------------------------
  // 4. PERIODIC TELEMETRY STREAMING (Every 500ms)
  // -------------------------------------------------------------
  if (now - lastTelemetryTime >= TELEMETRY_SEND_INTERVAL_MS) {
    lastTelemetryTime = now;

    // Stream structured JSON over Serial
    commMgr.printSerialData(
        currentFilteredDist, activeRisk, sensorMgr.getStatusString(),
        actuatorMgr.getBuzzerActive(), actuatorMgr.getVibrationActive(),
        actuatorMgr.getActiveLed(activeRisk));

    // Send HTTP POST telemetry to backend
    commMgr.sendTelemetry(
        currentFilteredDist, activeRisk, sensorMgr.getStatusString(),
        actuatorMgr.getBuzzerActive(), actuatorMgr.getVibrationActive(),
        actuatorMgr.getActiveLed(activeRisk));
  }

  // Brief yield for ESP32 FreeRTOS watchdog & network stack
  yield();
}
