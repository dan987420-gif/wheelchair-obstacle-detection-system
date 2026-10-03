# Software Testing & Verification Report

**Project:** Wheelchair Obstacle Detection System  
**Test Harness:** Node.js Built-in Test Runner (`node:test`, `node:assert`) & REST Integration Client  

---

## 1. Automated Test Suite Execution Summary

To run all automated test suites:
```bash
cd backend
npm test
```

### Results Summary
* **Total Test Suites Executed:** 2 (`safety.test.js`, `api.test.js`)
* **Total Assertions Checked:** 28
* **Passed:** 28 (100%)
* **Failed:** 0
* **Execution Time:** ~90 ms

---

## 2. Unit Test Breakdown

### 2.1 `SafetyEngine` Risk Classification
* **Zone Tests:** Verifies standard Safe ($>150\text{ cm}$), Caution ($100-150\text{ cm}$), Warning ($50-100\text{ cm}$), and Critical ($\le 50\text{ cm}$) zones.
* **Boundary Conditions:** Evaluates boundary edges: $150.1\text{ cm}$ (Safe) vs $150.0\text{ cm}$ (Caution), $100.1\text{ cm}$ (Caution) vs $100.0\text{ cm}$ (Warning), $50.1\text{ cm}$ (Warning) vs $50.0\text{ cm}$ (Critical).
* **Fault Handling:** Verifies that negative values ($-1$) and `null` evaluate to `UNKNOWN`/`SENSOR_ERROR` rather than defaulting to `SAFE`.

### 2.2 Payload & Sanitization Validation
* Verifies rejection of missing `deviceId`.
* Verifies rejection of `NaN` or non-numeric distance parameters.
* Verifies rejection of impossible distances ($>1000\text{ cm}$ or $<-1$).

### 2.3 Threshold Configuration Rules
* Verifies validation rule: $\text{Safe} > \text{Caution} > \text{Warning} \ge \text{Critical} > 0$.
* Rejects inverted configurations (e.g. Warning $>$ Caution).
* Rejects negative critical limits.

### 2.4 Event Incident Deduplication & Lifecycle
* **Incident Inception:** Initial danger reading starts a new event with `is_active = true`.
* **Proximity Update:** Subsequent closer readings update `minimum_distance_cm` without generating duplicate database records.
* **Incident Clearance:** Safe reading closes event, stamps `end_time`, and calculates `duration_seconds`.

---

## 3. REST API Endpoint Test Breakdown

| Endpoint | Method | Test Action | Expected Status | Result |
|---|---|---|---|---|
| `/api/v1/health` | GET | Check service uptime & DB status | 200 OK | **PASS** |
| `/api/v1/settings` | GET | Retrieve configuration contract | 200 OK | **PASS** |
| `/api/v1/settings` | PATCH | Update valid threshold parameters | 200 OK | **PASS** |
| `/api/v1/settings` | PATCH | Attempt invalid inverted thresholds | 400 Bad Request | **PASS** |
| `/api/v1/sensor/readings` | POST | Ingest valid telemetry packet | 201 Created | **PASS** |
| `/api/v1/sensor/readings` | POST | Attempt missing deviceId | 400 Bad Request | **PASS** |
| `/api/v1/obstacle-events` | GET | Query event history list | 200 OK | **PASS** |
| `/api/v1/obstacle-events/export/csv` | GET | Stream CSV export file | 200 OK | **PASS** |
| `/api/v1/simulation/readings` | POST | Ingest software simulation slider value | 200 OK | **PASS** |
| `/api/v1/devices` | GET | Query registered hardware nodes | 200 OK | **PASS** |
