/**
 * @file actuator_manager.h
 * @brief Non-blocking Multi-Modal Warnings (LEDs, Buzzer, Vibration Motor,
 * OLED)
 */

#ifndef ACTUATOR_MANAGER_H
#define ACTUATOR_MANAGER_H

#include <Arduino.h>
#include "config.h"
#include "safety_manager.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Wire.h>

class ActuatorManager {
private:
  Adafruit_SSD1306 display;
  bool oledAvailable;

  // Non-blocking timing trackers
  unsigned long lastBuzzerToggle;
  unsigned long lastVibrationToggle;
  unsigned long lastYellowBlink;
  unsigned long lastOledRefresh;

  bool buzzerState;
  bool vibrationState;
  bool yellowBlinkState;

public:
  ActuatorManager()
      : display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET),
        oledAvailable(false), lastBuzzerToggle(0), lastVibrationToggle(0),
        lastYellowBlink(0), lastOledRefresh(0), buzzerState(false),
        vibrationState(false), yellowBlinkState(false) {}

  void begin() {
    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_YELLOW, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    pinMode(PIN_VIBRATION, OUTPUT);

    // Initial state: all OFF
    silenceAll();

    // Initialize I2C OLED
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    if (display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
      oledAvailable = true;
      display.clearDisplay();
      display.setTextSize(1);
      display.setTextColor(SSD1306_WHITE);
      display.setCursor(0, 0);
      display.println(F("WHEELCHAIR SAFETY"));
      display.println(F("Firmware v1.0.0"));
      display.println(F("Self-Test in progress..."));
      display.display();
    }
  }

  void silenceAll() {
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_VIBRATION, LOW);
    buzzerState = false;
    vibrationState = false;
  }

  /**
   * @brief Executes startup self-test verifying all LEDs, buzzer and vibration
   * motor.
   */
  void runSelfTest() {
    // Stage 1: All LEDs ON
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, HIGH);
    digitalWrite(PIN_LED_RED, HIGH);
    digitalWrite(PIN_BUZZER, HIGH);
    digitalWrite(PIN_VIBRATION, HIGH);
    delay(200);

    // Stage 2: Silence buzzer & vibration, keep LEDs
    digitalWrite(PIN_BUZZER, LOW);
    digitalWrite(PIN_VIBRATION, LOW);
    delay(200);

    silenceAll();
  }

  /**
   * @brief Non-blocking actuator refresh loop driven by current safety risk
   * level
   */
  void update(RiskLevel risk, float distanceCm, const char *sensorStatus,
              unsigned long now) {
    switch (risk) {
    case RISK_SAFE:
      digitalWrite(PIN_LED_GREEN, HIGH);
      digitalWrite(PIN_LED_YELLOW, LOW);
      digitalWrite(PIN_LED_RED, LOW);
      digitalWrite(PIN_BUZZER, LOW);
      digitalWrite(PIN_VIBRATION, LOW);
      buzzerState = false;
      vibrationState = false;
      break;

    case RISK_CAUTION:
      // Yellow LED solid ON
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_YELLOW, HIGH);
      digitalWrite(PIN_LED_RED, LOW);

      // Buzzer: 100ms chirp every 1500ms
      if (buzzerState && (now - lastBuzzerToggle >= 100)) {
        digitalWrite(PIN_BUZZER, LOW);
        buzzerState = false;
        lastBuzzerToggle = now;
      } else if (!buzzerState && (now - lastBuzzerToggle >= 1400)) {
        digitalWrite(PIN_BUZZER, HIGH);
        buzzerState = true;
        lastBuzzerToggle = now;
      }

      // Vibration: 150ms gentle pulse every 1500ms
      if (vibrationState && (now - lastVibrationToggle >= 150)) {
        digitalWrite(PIN_VIBRATION, LOW);
        vibrationState = false;
        lastVibrationToggle = now;
      } else if (!vibrationState && (now - lastVibrationToggle >= 1350)) {
        digitalWrite(PIN_VIBRATION, HIGH);
        vibrationState = true;
        lastVibrationToggle = now;
      }
      break;

    case RISK_WARNING:
      // Yellow LED flashing at 250ms interval
      if (now - lastYellowBlink >= 250) {
        yellowBlinkState = !yellowBlinkState;
        digitalWrite(PIN_LED_YELLOW, yellowBlinkState ? HIGH : LOW);
        lastYellowBlink = now;
      }
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, LOW);

      // Buzzer: 150ms tone every 500ms
      if (buzzerState && (now - lastBuzzerToggle >= 150)) {
        digitalWrite(PIN_BUZZER, LOW);
        buzzerState = false;
        lastBuzzerToggle = now;
      } else if (!buzzerState && (now - lastBuzzerToggle >= 350)) {
        digitalWrite(PIN_BUZZER, HIGH);
        buzzerState = true;
        lastBuzzerToggle = now;
      }

      // Vibration: 200ms pulse every 500ms
      if (vibrationState && (now - lastVibrationToggle >= 200)) {
        digitalWrite(PIN_VIBRATION, LOW);
        vibrationState = false;
        lastVibrationToggle = now;
      } else if (!vibrationState && (now - lastVibrationToggle >= 300)) {
        digitalWrite(PIN_VIBRATION, HIGH);
        vibrationState = true;
        lastVibrationToggle = now;
      }
      break;

    case RISK_CRITICAL:
      // Red LED solid ON
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_YELLOW, LOW);
      digitalWrite(PIN_LED_RED, HIGH);

      // Buzzer: Rapid emergency alarm (100ms ON / 100ms OFF)
      if (now - lastBuzzerToggle >= 100) {
        buzzerState = !buzzerState;
        digitalWrite(PIN_BUZZER, buzzerState ? HIGH : LOW);
        lastBuzzerToggle = now;
      }

      // Vibration: Rapid haptic alert (150ms ON / 100ms OFF)
      if (vibrationState && (now - lastVibrationToggle >= 150)) {
        digitalWrite(PIN_VIBRATION, LOW);
        vibrationState = false;
        lastVibrationToggle = now;
      } else if (!vibrationState && (now - lastVibrationToggle >= 100)) {
        digitalWrite(PIN_VIBRATION, HIGH);
        vibrationState = true;
        lastVibrationToggle = now;
      }
      break;

    case RISK_UNKNOWN:
    default:
      // Sensor Error: Flash Red & Yellow alternating, double chirp
      digitalWrite(PIN_LED_GREEN, LOW);
      if (now - lastYellowBlink >= 300) {
        yellowBlinkState = !yellowBlinkState;
        digitalWrite(PIN_LED_YELLOW, yellowBlinkState ? HIGH : LOW);
        digitalWrite(PIN_LED_RED, yellowBlinkState ? LOW : HIGH);
        lastYellowBlink = now;
      }
      digitalWrite(PIN_BUZZER, LOW);
      digitalWrite(PIN_VIBRATION, LOW);
      break;
    }

    // Refresh OLED if interval elapsed
    if (oledAvailable && (now - lastOledRefresh >= OLED_REFRESH_INTERVAL_MS)) {
      renderOled(risk, distanceCm, sensorStatus);
      lastOledRefresh = now;
    }
  }

  void renderOled(RiskLevel risk, float distanceCm, const char *sensorStatus) {
    display.clearDisplay();
    display.setTextColor(SSD1306_WHITE);

    if (risk == RISK_CRITICAL) {
      display.setTextSize(1);
      display.setCursor(10, 0);
      display.println(F("! CRITICAL OBSTACLE !"));
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

      display.setTextSize(2);
      display.setCursor(15, 18);
      display.print(distanceCm, 1);
      display.print(F(" cm"));

      display.setTextSize(1);
      display.setCursor(0, 42);
      display.println(F("ACTION: STOP IMMEDIATELY"));
      display.setCursor(0, 54);
      display.print(F("BUZZER: ON | VIB: ON"));
    } else {
      display.setTextSize(1);
      display.setCursor(0, 0);
      display.println(F("WHEELCHAIR SAFETY SYS"));
      display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

      display.setCursor(0, 14);
      display.print(F("Dist : "));
      if (distanceCm >= 0) {
        display.print(distanceCm, 1);
        display.println(F(" cm"));
      } else {
        display.println(F("---"));
      }

      display.setCursor(0, 26);
      display.print(F("Risk : "));
      display.println(SafetyManager::riskToString(risk));

      display.setCursor(0, 38);
      display.print(F("Sens : "));
      display.println(sensorStatus);

      display.setCursor(0, 50);
      display.print(F("Dev  : "));
      display.print(DEVICE_ID);
      display.print(F(" (ONLINE)"));
    }

    display.display();
  }

  bool getBuzzerActive() const { return buzzerState; }
  bool getVibrationActive() const { return vibrationState; }
  const char *getActiveLed(RiskLevel risk) const {
    switch (risk) {
    case RISK_SAFE:
      return "GREEN";
    case RISK_CAUTION:
      return "YELLOW";
    case RISK_WARNING:
      return "YELLOW_BLINKING";
    case RISK_CRITICAL:
      return "RED";
    default:
      return "OFF";
    }
  }
};

#endif // ACTUATOR_MANAGER_H
