/**
 * @file safety_manager.h
 * @brief Safety Risk Classification & Hysteresis Engine
 */

#ifndef SAFETY_MANAGER_H
#define SAFETY_MANAGER_H

#include <Arduino.h>
#include "config.h"

enum RiskLevel {
  RISK_SAFE,
  RISK_CAUTION,
  RISK_WARNING,
  RISK_CRITICAL,
  RISK_UNKNOWN
};

class SafetyManager {
private:
  float safeThreshold;
  float cautionThreshold;
  float warningThreshold;
  float criticalThreshold;
  float hysteresis;
  RiskLevel currentRisk;

public:
  SafetyManager() : 
    safeThreshold(DEFAULT_SAFE_DISTANCE_CM),
    cautionThreshold(DEFAULT_CAUTION_DISTANCE_CM),
    warningThreshold(DEFAULT_WARNING_DISTANCE_CM),
    criticalThreshold(DEFAULT_CRITICAL_DISTANCE_CM),
    hysteresis(DEFAULT_HYSTERESIS_CM),
    currentRisk(RISK_SAFE) {}

  void updateThresholds(float safe, float caution, float warning, float critical, float hyst) {
    if (safe >= caution && caution > warning && warning > critical && critical > 0) {
      safeThreshold = safe;
      cautionThreshold = caution;
      warningThreshold = warning;
      criticalThreshold = critical;
      hysteresis = hyst;
    }
  }

  /**
   * @brief Evaluates distance against thresholds with hysteresis damping
   * Prevents rapid chatter when oscillating near boundary thresholds.
   */
  RiskLevel calculateRisk(float distanceCm) {
    if (distanceCm < 0) {
      currentRisk = RISK_UNKNOWN;
      return RISK_UNKNOWN;
    }

    // Evaluate risk with state-dependent hysteresis margins
    switch (currentRisk) {
      case RISK_CRITICAL:
        // Transition up from CRITICAL only if distance increases beyond critical + hysteresis
        if (distanceCm > (criticalThreshold + hysteresis)) {
          if (distanceCm > cautionThreshold) {
            currentRisk = RISK_SAFE;
          } else if (distanceCm > warningThreshold) {
            currentRisk = RISK_CAUTION;
          } else {
            currentRisk = RISK_WARNING;
          }
        }
        break;

      case RISK_WARNING:
        if (distanceCm <= criticalThreshold) {
          currentRisk = RISK_CRITICAL;
        } else if (distanceCm > (warningThreshold + hysteresis)) {
          if (distanceCm > cautionThreshold) {
            currentRisk = RISK_SAFE;
          } else {
            currentRisk = RISK_CAUTION;
          }
        }
        break;

      case RISK_CAUTION:
        if (distanceCm <= criticalThreshold) {
          currentRisk = RISK_CRITICAL;
        } else if (distanceCm <= warningThreshold) {
          currentRisk = RISK_WARNING;
        } else if (distanceCm > (cautionThreshold + hysteresis)) {
          currentRisk = RISK_SAFE;
        }
        break;

      case RISK_SAFE:
      default:
        if (distanceCm <= criticalThreshold) {
          currentRisk = RISK_CRITICAL;
        } else if (distanceCm <= warningThreshold) {
          currentRisk = RISK_WARNING;
        } else if (distanceCm <= cautionThreshold) {
          currentRisk = RISK_CAUTION;
        } else {
          currentRisk = RISK_SAFE;
        }
        break;
    }

    return currentRisk;
  }

  RiskLevel getCurrentRisk() const {
    return currentRisk;
  }

  static const char* riskToString(RiskLevel risk) {
    switch (risk) {
      case RISK_SAFE:     return "SAFE";
      case RISK_CAUTION:  return "CAUTION";
      case RISK_WARNING:  return "WARNING";
      case RISK_CRITICAL: return "CRITICAL";
      default:            return "UNKNOWN";
    }
  }

  float getSafeThreshold() const { return safeThreshold; }
  float getCautionThreshold() const { return cautionThreshold; }
  float getWarningThreshold() const { return warningThreshold; }
  float getCriticalThreshold() const { return criticalThreshold; }
  float getHysteresis() const { return hysteresis; }
};

#endif // SAFETY_MANAGER_H
