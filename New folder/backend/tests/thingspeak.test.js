const test = require('node:test');
const assert = require('node:assert');
const thingspeakService = require('../src/services/thingspeakService');

test('ThingSpeak Service - Feed Entry Parser & Field Mapping', () => {
  const sampleFeed = {
    entry_id: 42,
    created_at: '2026-10-12T14:00:00Z',
    field1: '125.0', // Distance_cm
    field2: '1',     // Risk_Level (CAUTION)
    field3: '1',     // Buzzer (Active)
    field4: '2',     // LED_Status (YELLOW)
    field5: '1'      // Vibration (Active)
  };

  const parsed = thingspeakService.parseFeedEntry(sampleFeed);

  assert.strictEqual(parsed.rawFeedId, 42);
  assert.strictEqual(parsed.distanceCm, 125.0);
  assert.strictEqual(parsed.riskLevel, 'CAUTION');
  assert.strictEqual(parsed.actuators.buzzer, true);
  assert.strictEqual(parsed.actuators.led, 'YELLOW');
  assert.strictEqual(parsed.actuators.vibration, true);
  assert.strictEqual(parsed.sensorStatus, 'OK');
  assert.strictEqual(parsed.source, 'THINGSPEAK_CLOUD');
});

test('ThingSpeak Service - Sensor Scenario Mappings', () => {
  // Scenario 1: 200 cm -> SAFE, Risk Code 0, LED 1 (GREEN), Buzzer 0, Vibration 0
  const feedSafe = {
    entry_id: 101,
    created_at: '2026-10-12T14:01:00Z',
    field1: '200.0',
    field2: '0',
    field3: '0',
    field4: '1',
    field5: '0'
  };
  const parsedSafe = thingspeakService.parseFeedEntry(feedSafe);
  assert.strictEqual(parsedSafe.distanceCm, 200.0);
  assert.strictEqual(parsedSafe.riskLevel, 'SAFE');
  assert.strictEqual(parsedSafe.actuators.buzzer, false);
  assert.strictEqual(parsedSafe.actuators.vibration, false);
  assert.strictEqual(parsedSafe.actuators.led, 'GREEN');

  // Scenario 2: 125 cm -> CAUTION, Risk Code 1, LED 2 (YELLOW), Buzzer 1, Vibration 1
  const feedCaution = {
    entry_id: 102,
    created_at: '2026-10-12T14:02:00Z',
    field1: '125.0',
    field2: '1',
    field3: '1',
    field4: '2',
    field5: '1'
  };
  const parsedCaution = thingspeakService.parseFeedEntry(feedCaution);
  assert.strictEqual(parsedCaution.distanceCm, 125.0);
  assert.strictEqual(parsedCaution.riskLevel, 'CAUTION');
  assert.strictEqual(parsedCaution.actuators.buzzer, true);
  assert.strictEqual(parsedCaution.actuators.vibration, true);
  assert.strictEqual(parsedCaution.actuators.led, 'YELLOW');

  // Scenario 3: 65 cm -> WARNING, Risk Code 2, LED 3 (YELLOW_BLINKING), Buzzer 1, Vibration 1
  const feedWarning = {
    entry_id: 103,
    created_at: '2026-10-12T14:03:00Z',
    field1: '65.0',
    field2: '2',
    field3: '1',
    field4: '3',
    field5: '1'
  };
  const parsedWarning = thingspeakService.parseFeedEntry(feedWarning);
  assert.strictEqual(parsedWarning.distanceCm, 65.0);
  assert.strictEqual(parsedWarning.riskLevel, 'WARNING');
  assert.strictEqual(parsedWarning.actuators.buzzer, true);
  assert.strictEqual(parsedWarning.actuators.vibration, true);
  assert.strictEqual(parsedWarning.actuators.led, 'YELLOW_BLINKING');

  // Scenario 4: 20 cm -> CRITICAL, Risk Code 3, LED 4 (RED), Buzzer 1, Vibration 1
  const feedCritical = {
    entry_id: 104,
    created_at: '2026-10-12T14:04:00Z',
    field1: '20.0',
    field2: '3',
    field3: '1',
    field4: '4',
    field5: '1'
  };
  const parsedCritical = thingspeakService.parseFeedEntry(feedCritical);
  assert.strictEqual(parsedCritical.distanceCm, 20.0);
  assert.strictEqual(parsedCritical.riskLevel, 'CRITICAL');
  assert.strictEqual(parsedCritical.actuators.buzzer, true);
  assert.strictEqual(parsedCritical.actuators.vibration, true);
  assert.strictEqual(parsedCritical.actuators.led, 'RED');
});

test('ThingSpeak Service - Corrupted / Error Feeds Handling', () => {
  // Null entry
  assert.strictEqual(thingspeakService.parseFeedEntry(null), null);

  // Invalid non-numeric distance
  const invalidFeed = {
    entry_id: 105,
    field1: 'NaN',
    field2: '99',
    field3: '0',
    field4: '0',
    field5: '0'
  };
  const parsedInvalid = thingspeakService.parseFeedEntry(invalidFeed);
  assert.strictEqual(parsedInvalid.distanceCm, -1.0);
  assert.strictEqual(parsedInvalid.sensorStatus, 'ERROR');
  assert.strictEqual(parsedInvalid.riskLevel, 'SAFE'); // fallback default
  assert.strictEqual(parsedInvalid.actuators.led, 'OFF');
});
