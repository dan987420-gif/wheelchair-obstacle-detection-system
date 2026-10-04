/**
 * @file config.h
 * @brief Centralized Configuration and Pinout for Wheelchair Obstacle Detection System
 * @version 1.0.0
 *
 * Safe Distance Logic:
 *   - SAFE:     Distance > 150 cm
 *   - CAUTION:  100 cm < Distance <= 150 cm
 *   - WARNING:  30 cm  < Distance <= 100 cm
 *   - CRITICAL: Distance <= 30 cm
 */

#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ==========================================
// DEVICE IDENTITY & VERSIONING
// ==========================================
#define DEVICE_ID "WC-001"
#define DEVICE_NAME "Wheelchair Prototype"
#define FIRMWARE_VERSION "1.0.0"
#define PROTOCOL_VERSION "1.0"
#define DATA_SOURCE_WOKWI "WOKWI"

// ==========================================
// GPIO PIN ASSIGNMENTS (ESP32 DevKit)
// ==========================================
// HC-SR04 Ultrasonic Distance Sensor
#define PIN_TRIG 5  // Output: 10µs ultrasonic trigger pulse
#define PIN_ECHO 18 // Input: Echo pulse duration (3.3V safe on ESP32)

// Visual Indicators (LEDs)
#define PIN_LED_GREEN 25  // Safe status indicator
#define PIN_LED_YELLOW 26 // Caution / Warning status indicator
#define PIN_LED_RED 27    // Critical hazard alert indicator

// Acoustic Alert
#define PIN_BUZZER 14 // Piezo Buzzer / Alarm output

// Haptic Alert (Vibration Motor Actuator)
#define PIN_VIBRATION 12 // Vibration motor driver output

// Optional I2C OLED Display (SSD1306 128x64)
#define PIN_I2C_SDA 21 // I2C Data Line
#define PIN_I2C_SCL 22 // I2C Clock Line
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// ==========================================
// DISTANCE THRESHOLDS (Centimeters)
// ==========================================
#define DEFAULT_SAFE_DISTANCE_CM 150.0f
#define DEFAULT_CAUTION_DISTANCE_CM 150.0f
#define DEFAULT_WARNING_DISTANCE_CM 100.0f
#define DEFAULT_CRITICAL_DISTANCE_CM 30.0f
#define DEFAULT_HYSTERESIS_CM 4.0f

// Physical Sensor Limits
#define SENSOR_MIN_DISTANCE_CM 2.0f
#define SENSOR_MAX_DISTANCE_CM 400.0f
#define SENSOR_TIMEOUT_US 25000 // ~430 cm timeout limit

// Filtering Window
#define FILTER_WINDOW_SIZE 5 // 5-sample median moving average

// ==========================================
// TIMING CONSTANTS (Milliseconds)
// ==========================================
#define SENSOR_READ_INTERVAL_MS 100      // Read sensor every 100ms
#define TELEMETRY_SEND_INTERVAL_MS 500   // Send data to backend every 500ms
#define HEARTBEAT_INTERVAL_MS 5000       // Periodic device heartbeat every 5s
#define OLED_REFRESH_INTERVAL_MS 200     // Refresh local OLED every 200ms
#define WIFI_RECONNECT_INTERVAL_MS 10000 // Non-blocking WiFi reconnect retry

// ==========================================
// NETWORK & BACKEND CONFIGURATION
// ==========================================
// Wokwi simulated WiFi AP
#define WIFI_SSID "Wokwi-GUEST"
#define WIFI_PASSWORD ""

// Default Backend URL
#define DEFAULT_BACKEND_HOST "http://localhost:5000"
#define SENSOR_READINGS_ENDPOINT "/api/v1/sensor/readings"
#define DEVICE_HEARTBEAT_ENDPOINT "/api/v1/devices/heartbeat"

// ==========================================
// THINGSPEAK CONFIGURATION
// ==========================================
#define THINGSPEAK_CHANNEL_ID 3519643
#define THINGSPEAK_WRITE_API_KEY "PLACEHOLDER_THINGSPEAK_WRITE_KEY"
#define THINGSPEAK_UPDATE_URL "https://api.thingspeak.com/update"
#define THINGSPEAK_INTERVAL_MS 16000

#endif // CONFIG_H
