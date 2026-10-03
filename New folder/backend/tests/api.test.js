const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { app, server: appServer } = require('../src/server');

let testServer;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    testServer = app.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    testServer.close(resolve);
  });
});

test('API - Health Check Endpoint', async () => {
  const res = await fetch(`${baseUrl}/api/v1/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'ok');
  assert.strictEqual(data.service, 'wheelchair-obstacle-detection-backend');
});

test('API - Settings Retrieval & Updates', async () => {
  // GET settings
  const resGet = await fetch(`${baseUrl}/api/v1/settings`);
  assert.strictEqual(resGet.status, 200);
  const dataGet = await resGet.json();
  assert.strictEqual(dataGet.success, true);
  assert.ok(dataGet.data.safeDistanceCm);

  // PATCH settings with valid payload
  const resPatch = await fetch(`${baseUrl}/api/v1/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ safeDistanceCm: 160, cautionDistanceCm: 110, warningDistanceCm: 55, criticalDistanceCm: 25, hysteresisCm: 4 })
  });
  assert.strictEqual(resPatch.status, 200);
  const dataPatch = await resPatch.json();
  assert.strictEqual(dataPatch.data.safeDistanceCm, 160);

  // PATCH settings with invalid payload (safe < caution)
  const resInvalid = await fetch(`${baseUrl}/api/v1/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ safeDistanceCm: 80, cautionDistanceCm: 120 })
  });
  assert.strictEqual(resInvalid.status, 400);
});

test('API - Sensor Telemetry Ingestion & Risk Classification', async () => {
  // Safe telemetry (> 160 cm)
  const resSafe = await fetch(`${baseUrl}/api/v1/sensor/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: 'WC-001',
      distanceCm: 185.2,
      sensorType: 'HC-SR04',
      source: 'WOKWI'
    })
  });
  assert.strictEqual(resSafe.status, 201);
  const dataSafe = await resSafe.json();
  assert.strictEqual(dataSafe.data.calculatedRisk, 'SAFE');

  // Critical telemetry (< 25 cm)
  const resCrit = await fetch(`${baseUrl}/api/v1/sensor/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: 'WC-001',
      distanceCm: 18.0,
      sensorType: 'HC-SR04',
      source: 'WOKWI'
    })
  });
  assert.strictEqual(resCrit.status, 201);
  const dataCrit = await resCrit.json();
  assert.strictEqual(dataCrit.data.calculatedRisk, 'CRITICAL');
});

test('API - Obstacle Events & CSV Export', async () => {
  const resEvents = await fetch(`${baseUrl}/api/v1/obstacle-events`);
  assert.strictEqual(resEvents.status, 200);
  const dataEvents = await resEvents.json();
  assert.strictEqual(dataEvents.success, true);
  assert.ok(Array.isArray(dataEvents.data));

  const resCsv = await fetch(`${baseUrl}/api/v1/obstacle-events/export/csv`);
  assert.strictEqual(resCsv.status, 200);
  const text = await resCsv.text();
  assert.ok(text.includes('Event ID,Device ID,Risk Level'));
});

test('API - Simulation & Devices', async () => {
  // Simulation reading
  const resSim = await fetch(`${baseUrl}/api/v1/simulation/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ distanceCm: 45 })
  });
  assert.strictEqual(resSim.status, 200);
  const dataSim = await resSim.json();
  assert.strictEqual(dataSim.data.calculatedRisk, 'CRITICAL');

  // Device status
  const resDev = await fetch(`${baseUrl}/api/v1/devices`);
  assert.strictEqual(resDev.status, 200);
  const dataDev = await resDev.json();
  assert.ok(dataDev.data.length > 0);
});
