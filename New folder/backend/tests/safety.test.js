const test = require('node:test');
const assert = require('node:assert');
const safetyEngine = require('../src/safetyEngine');
const eventManager = require('../src/eventManager');

const defaultTestSettings = {
  safeDistanceCm: 150.0,
  cautionDistanceCm: 100.0,
  warningDistanceCm: 50.0,
  criticalDistanceCm: 50.0,
  hysteresisCm: 4.0
};

test('SafetyEngine - Distance Risk Classification Matrix', () => {
  // Safe zone (> 150 cm)
  assert.strictEqual(safetyEngine.calculateRisk(250, 'SAFE', defaultTestSettings), 'SAFE');
  assert.strictEqual(safetyEngine.calculateRisk(160, 'SAFE', defaultTestSettings), 'SAFE');
  assert.strictEqual(safetyEngine.calculateRisk(150.1, 'SAFE', defaultTestSettings), 'SAFE');

  // Caution zone (100 < dist <= 150 cm)
  assert.strictEqual(safetyEngine.calculateRisk(150, 'SAFE', defaultTestSettings), 'CAUTION');
  assert.strictEqual(safetyEngine.calculateRisk(125, 'SAFE', defaultTestSettings), 'CAUTION');
  assert.strictEqual(safetyEngine.calculateRisk(100.1, 'SAFE', defaultTestSettings), 'CAUTION');

  // Warning zone (50 < dist <= 100 cm)
  assert.strictEqual(safetyEngine.calculateRisk(100, 'SAFE', defaultTestSettings), 'WARNING');
  assert.strictEqual(safetyEngine.calculateRisk(75, 'SAFE', defaultTestSettings), 'WARNING');
  assert.strictEqual(safetyEngine.calculateRisk(50.1, 'SAFE', defaultTestSettings), 'WARNING');

  // Critical zone (dist <= 50 cm)
  assert.strictEqual(safetyEngine.calculateRisk(50, 'SAFE', defaultTestSettings), 'CRITICAL');
  assert.strictEqual(safetyEngine.calculateRisk(30, 'SAFE', defaultTestSettings), 'CRITICAL');
  assert.strictEqual(safetyEngine.calculateRisk(15, 'SAFE', defaultTestSettings), 'CRITICAL');
  assert.strictEqual(safetyEngine.calculateRisk(2, 'SAFE', defaultTestSettings), 'CRITICAL');

  // Invalid / Timeout / Disconnected
  assert.strictEqual(safetyEngine.calculateRisk(-1, 'SAFE', defaultTestSettings), 'UNKNOWN');
  assert.strictEqual(safetyEngine.calculateRisk(null, 'SAFE', defaultTestSettings), 'UNKNOWN');
});

test('SafetyEngine - Input Payload Validation', () => {
  // Valid payload
  const valid = safetyEngine.validateReading({
    deviceId: 'WC-001',
    distanceCm: 82.4
  });
  assert.strictEqual(valid.valid, true);
  assert.strictEqual(valid.sanitizedDistance, 82.4);

  // Missing deviceId
  const missingDev = safetyEngine.validateReading({ distanceCm: 50 });
  assert.strictEqual(missingDev.valid, false);

  // NaN distance
  const nanDist = safetyEngine.validateReading({ deviceId: 'WC-001', distanceCm: 'invalid' });
  assert.strictEqual(nanDist.valid, false);

  // Out of bounds distance
  const outOfBounds = safetyEngine.validateReading({ deviceId: 'WC-001', distanceCm: 1500 });
  assert.strictEqual(outOfBounds.valid, false);
});

test('SafetyEngine - Threshold Configuration Validation', () => {
  // Valid hierarchy: 180 > 120 > 60 >= 30, hyst 5
  const validConfig = safetyEngine.validateSettings({
    safeDistanceCm: 180,
    cautionDistanceCm: 120,
    warningDistanceCm: 60,
    criticalDistanceCm: 30,
    hysteresisCm: 5
  });
  assert.strictEqual(validConfig.valid, true);

  // Invalid hierarchy (warning > caution)
  const invalidConfig = safetyEngine.validateSettings({
    safeDistanceCm: 150,
    cautionDistanceCm: 80,
    warningDistanceCm: 100, // Error: warning > caution
    criticalDistanceCm: 30,
    hysteresisCm: 4
  });
  assert.strictEqual(invalidConfig.valid, false);

  // Negative critical threshold
  const negativeCritical = safetyEngine.validateSettings({
    safeDistanceCm: 150,
    cautionDistanceCm: 100,
    warningDistanceCm: 50,
    criticalDistanceCm: -5,
    hysteresisCm: 4
  });
  assert.strictEqual(negativeCritical.valid, false);
});

test('EventManager - Obstacle Lifecycle & Deduplication', () => {
  const testDev = 'TEST-WC-999';

  // 1. Initial danger reading -> Starts event
  const ev1 = eventManager.processReadingEvent(testDev, 75, 'WARNING', 'TEST');
  assert.ok(ev1);
  assert.strictEqual(ev1.is_active, true);
  assert.strictEqual(ev1.minimum_distance_cm, 75);

  // 2. Subsequent closer reading -> Updates active event without creating duplicate
  const ev2 = eventManager.processReadingEvent(testDev, 28, 'CRITICAL', 'TEST');
  assert.ok(ev2);
  assert.strictEqual(ev2.id, ev1.id);
  assert.strictEqual(ev2.minimum_distance_cm, 28);
  assert.strictEqual(ev2.risk_level, 'CRITICAL');

  // 3. Sensor returns to SAFE -> Closes event
  const ev3 = eventManager.processReadingEvent(testDev, 200, 'SAFE', 'TEST');
  assert.ok(ev3);
  assert.strictEqual(ev3.is_active, false);
  assert.ok(ev3.end_time);
});
