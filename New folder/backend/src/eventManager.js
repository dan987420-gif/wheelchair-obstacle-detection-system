const db = require('./database');

class EventManager {
  /**
   * @brief Evaluates an incoming reading to manage continuous obstacle incident lifecycles.
   * Prevents flooding by grouping sequential critical/warning readings into a single event with min distance & duration.
   */
  processReadingEvent(deviceId, distanceCm, calculatedRisk, source) {
    const activeEvent = db.getActiveObstacleEvent(deviceId);
    const isDangerState = ['CAUTION', 'WARNING', 'CRITICAL'].includes(calculatedRisk);

    if (isDangerState) {
      if (activeEvent) {
        // Update ongoing event with lowest distance reached and elevated risk
        return db.updateActiveObstacleEvent(activeEvent.id, {
          distanceCm,
          riskLevel: calculatedRisk
        });
      } else {
        // Initiate new obstacle event
        return db.startObstacleEvent({
          deviceId,
          riskLevel: calculatedRisk,
          distanceCm,
          source
        });
      }
    } else {
      // Risk is SAFE or UNKNOWN: Close any existing active obstacle event
      if (activeEvent) {
        return db.closeObstacleEvent(activeEvent.id);
      }
    }

    return null;
  }
}

module.exports = new EventManager();
