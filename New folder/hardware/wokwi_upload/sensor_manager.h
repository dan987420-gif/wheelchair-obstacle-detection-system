/**
 * @file sensor_manager.h
 * @brief HC-SR04 Ultrasonic Distance Sensor Driver & Signal Filtering
 */

#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H

#include <Arduino.h>
#include "config.h"

enum SensorStatus {
  SENSOR_OK,
  SENSOR_TIMEOUT,
  SENSOR_OUT_OF_BOUNDS,
  SENSOR_DISCONNECTED
};

class SensorManager {
private:
  float history[FILTER_WINDOW_SIZE];
  uint8_t historyIndex;
  uint8_t sampleCount;
  uint32_t consecutiveErrors;
  SensorStatus currentStatus;
  float lastValidDistance;

public:
  SensorManager() : historyIndex(0), sampleCount(0), consecutiveErrors(0), 
                    currentStatus(SENSOR_OK), lastValidDistance(200.0f) {
    for (int i = 0; i < FILTER_WINDOW_SIZE; i++) {
      history[i] = 200.0f; // Initialize with safe baseline
    }
  }

  void begin() {
    pinMode(PIN_TRIG, OUTPUT);
    pinMode(PIN_ECHO, INPUT);
    digitalWrite(PIN_TRIG, LOW);
  }

  /**
   * @brief Generates standard 10µs ultrasonic pulse and measures echo round-trip.
   * Speed of sound in air is ~343 m/s = 0.0343 cm/µs.
   * Distance (cm) = (Duration * 0.0343) / 2
   */
  float measureRawDistance() {
    // Ensure clean LOW pulse before triggering
    digitalWrite(PIN_TRIG, LOW);
    delayMicroseconds(2);

    // Send 10 microsecond HIGH pulse
    digitalWrite(PIN_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_TRIG, LOW);

    // Read echo duration with safety timeout
    unsigned long duration = pulseIn(PIN_ECHO, HIGH, SENSOR_TIMEOUT_US);

    if (duration == 0) {
      consecutiveErrors++;
      if (consecutiveErrors > 5) {
        currentStatus = SENSOR_TIMEOUT;
      }
      return -1.0f; // Indicates pulse timeout / no echo received
    }

    float rawCm = (duration * 0.0343f) / 2.0f;

    // Boundary check
    if (rawCm < SENSOR_MIN_DISTANCE_CM || rawCm > SENSOR_MAX_DISTANCE_CM) {
      consecutiveErrors++;
      currentStatus = SENSOR_OUT_OF_BOUNDS;
      return -1.0f;
    }

    // Reset error counter upon valid reading
    consecutiveErrors = 0;
    currentStatus = SENSOR_OK;
    return rawCm;
  }

  /**
   * @brief Applies circular-buffer median & trimmed moving average filter to reject spurious noise.
   */
  float getFilteredDistance() {
    float raw = measureRawDistance();

    if (raw < 0) {
      // In case of transient glitch, return last known distance if within safe decay window
      if (consecutiveErrors < 3) {
        return lastValidDistance;
      }
      return -1.0f; // Return error state after repeated failures
    }

    // Insert into circular history buffer
    history[historyIndex] = raw;
    historyIndex = (historyIndex + 1) % FILTER_WINDOW_SIZE;
    if (sampleCount < FILTER_WINDOW_SIZE) {
      sampleCount++;
    }

    // Sort buffer copy for median extraction
    float sorted[FILTER_WINDOW_SIZE];
    for (int i = 0; i < sampleCount; i++) {
      sorted[i] = history[i];
    }

    // Simple bubble sort for small sample window
    for (int i = 0; i < sampleCount - 1; i++) {
      for (int j = 0; j < sampleCount - i - 1; j++) {
        if (sorted[j] > sorted[j + 1]) {
          float temp = sorted[j];
          sorted[j] = sorted[j + 1];
          sorted[j + 1] = temp;
        }
      }
    }

    float filtered = sorted[sampleCount / 2];
    lastValidDistance = filtered;
    return filtered;
  }

  SensorStatus getStatus() const {
    return currentStatus;
  }

  const char* getStatusString() const {
    switch (currentStatus) {
      case SENSOR_OK: return "OK";
      case SENSOR_TIMEOUT: return "TIMEOUT";
      case SENSOR_OUT_OF_BOUNDS: return "OUT_OF_BOUNDS";
      case SENSOR_DISCONNECTED: return "DISCONNECTED";
      default: return "UNKNOWN";
    }
  }
};

#endif // SENSOR_MANAGER_H
