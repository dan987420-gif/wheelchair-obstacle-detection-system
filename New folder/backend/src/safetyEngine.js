const db = require('./database');
const config = require('./config');

class SafetyEngine {
  /**
   * @brief Evaluates risk level strictly from distance and server configuration.
   * Specification:
   *   - SAFE:     distance > safeDistanceCm (e.g. > 150 cm)
   *   - CAUTION:  cautionDistanceCm < distance <= safeDistanceCm (e.g. 100 cm - 150 cm)
   *   - WARNING:  warningDistanceCm < distance <= cautionDistanceCm (e.g. 50 cm - 100 cm)
   *   - CRITICAL: distance <= warningDistanceCm (e.g. <= 50 cm)
   *   - UNKNOWN:  distance < 0 or invalid (Sensor timeout / disconnection)
   */
  calculateRisk(distanceCm, currentRisk = 'SAFE', customSettings = null) {
    if (distanceCm === null || distanceCm === undefined || distanceCm < 0) {
      return 'UNKNOWN';
    }

    const settings = customSettings || db.getSettings() || config.defaultThresholds;
    const safe = Number(settings.safeDistanceCm) || 150.0;
    const caution = Number(settings.cautionDistanceCm) || 100.0;
    const warning = Number(settings.warningDistanceCm) || 50.0;
    const critical = Number(settings.criticalDistanceCm) || 50.0;
    const hyst = Number(settings.hysteresisCm) || 4.0;

    const effectiveCritical = Math.max(critical, warning);

    // Hysteresis-aware transitions
    if (currentRisk === 'CRITICAL') {
      if (distanceCm > (effectiveCritical + hyst)) {
        if (distanceCm > (safe + hyst)) return 'SAFE';
        if (distanceCm > (caution + hyst)) return 'CAUTION';
        return 'WARNING';
      }
      return 'CRITICAL';
    }

    if (currentRisk === 'WARNING') {
      if (distanceCm <= effectiveCritical) return 'CRITICAL';
      if (distanceCm > (caution + hyst)) {
        return (distanceCm > (safe + hyst)) ? 'SAFE' : 'CAUTION';
      }
      return 'WARNING';
    }

    if (currentRisk === 'CAUTION') {
      if (distanceCm <= effectiveCritical) return 'CRITICAL';
      if (distanceCm <= warning) return 'WARNING';
      if (distanceCm > (safe + hyst)) return 'SAFE';
      return 'CAUTION';
    }

    // Default baseline transition from SAFE
    if (distanceCm <= effectiveCritical) return 'CRITICAL';
    if (distanceCm <= caution) return 'WARNING';
    if (distanceCm <= safe) return 'CAUTION';
    return 'SAFE';
  }

  /**
   * @brief Strict validation of incoming sensor reading payloads.
   */
  validateReading(payload) {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: 'Payload must be a valid JSON object.' };
    }

    if (!payload.deviceId || typeof payload.deviceId !== 'string' || payload.deviceId.trim() === '') {
      return { valid: false, error: 'Missing or invalid field: deviceId.' };
    }

    if (payload.distanceCm === undefined || payload.distanceCm === null) {
      return { valid: false, error: 'Missing field: distanceCm.' };
    }

    const dist = Number(payload.distanceCm);
    if (isNaN(dist)) {
      return { valid: false, error: 'distanceCm must be a valid number.' };
    }

    if (dist < -1 || dist > 1000) {
      return { valid: false, error: 'distanceCm out of physical sensor range (-1 to 1000cm).' };
    }

    return { valid: true, sanitizedDistance: dist >= 0 ? Math.round(dist * 10) / 10 : -1 };
  }

  /**
   * @brief Validates threshold consistency: safe > caution > warning > critical > 0.
   */
  validateSettings(payload) {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: 'Settings payload must be an object.' };
    }

    const safe = Number(payload.safeDistanceCm);
    const caution = Number(payload.cautionDistanceCm);
    const warning = Number(payload.warningDistanceCm);
    const critical = Number(payload.criticalDistanceCm);
    const hyst = Number(payload.hysteresisCm);

    if (isNaN(safe) || isNaN(caution) || isNaN(warning) || isNaN(critical) || isNaN(hyst)) {
      return { valid: false, error: 'All threshold values must be valid numeric values.' };
    }

    if (critical <= 0) {
      return { valid: false, error: 'Critical distance threshold must be greater than 0.' };
    }

    if (critical > warning) {
      return { valid: false, error: 'Critical threshold must be less than or equal to Warning threshold.' };
    }

    if (warning >= caution) {
      return { valid: false, error: 'Warning threshold must be strictly less than Caution threshold.' };
    }

    if (caution >= safe) {
      return { valid: false, error: 'Caution threshold must be strictly less than Safe threshold.' };
    }

    if (hyst < 0 || hyst > 20) {
      return { valid: false, error: 'Hysteresis must be between 0 and 20 cm.' };
    }

    return {
      valid: true,
      sanitized: {
        safeDistanceCm: safe,
        cautionDistanceCm: caution,
        warningDistanceCm: warning,
        criticalDistanceCm: critical,
        hysteresisCm: hyst
      }
    };
  }
}

module.exports = new SafetyEngine();
