# Hardware Test Plan & Verification Matrix

**Project:** Wheelchair Obstacle Detection System  
**Test Platform:** ESP32 DevKit + HC-SR04 + Multi-Modal Actuators in Wokwi Simulation & Lab Bench  

---

## 1. Hardware Verification Test Matrix

| Test ID | Input Distance | Expected Risk | Green LED (GPIO 25) | Yellow LED (GPIO 26) | Red LED (GPIO 27) | Buzzer (GPIO 14) | Vibration (GPIO 12) | OLED Display HUD | Result |
|---|---|---|---|---|---|---|---|---|---|
| **H-001** | 200.0 cm | SAFE | **ON** | OFF | OFF | Silent | Inactive | `Risk: SAFE \| Dist: 200cm` | **PASS** |
| **H-002** | 160.0 cm | SAFE | **ON** | OFF | OFF | Silent | Inactive | `Risk: SAFE \| Dist: 160cm` | **PASS** |
| **H-003** | 135.0 cm | CAUTION | OFF | **ON** | OFF | Slow Beep (1.5s) | Mild Pulse (1.5s) | `Risk: CAUTION \| Dist: 135cm` | **PASS** |
| **H-004** | 105.0 cm | CAUTION | OFF | **ON** | OFF | Slow Beep (1.5s) | Mild Pulse (1.5s) | `Risk: CAUTION \| Dist: 105cm` | **PASS** |
| **H-005** | 80.0 cm | WARNING | OFF | **Blinking (250ms)** | OFF | Med Beep (500ms) | Med Pulse (500ms) | `Risk: WARNING \| Dist: 80cm` | **PASS** |
| **H-006** | 55.0 cm | WARNING | OFF | **Blinking (250ms)** | OFF | Med Beep (500ms) | Med Pulse (500ms) | `Risk: WARNING \| Dist: 55cm` | **PASS** |
| **H-007** | 35.0 cm | CRITICAL | OFF | OFF | **ON** | Rapid Siren (100ms)| Continuous (150ms)| `! CRITICAL OBSTACLE !` | **PASS** |
| **H-008** | 15.0 cm | CRITICAL | OFF | OFF | **ON** | Rapid Siren (100ms)| Continuous (150ms)| `! CRITICAL OBSTACLE !` | **PASS** |
| **H-009** | -1 (Timeout)| SENSOR_ERROR | OFF | **Alt. Flash** | **Alt. Flash** | Silent | Inactive | `Sensor: TIMEOUT` | **PASS** |
| **H-010** | Wi-Fi Offline| Retains Safety| Unchanged | Unchanged | Unchanged | Active | Active | Local OLED & Local Alert Active | **PASS** |

---

## 2. Dynamic Hysteresis Test Execution

1. **Step 1 (Approaching Hazard):**
   * Distance moves: $200\text{ cm} \rightarrow 140\text{ cm} \rightarrow 80\text{ cm} \rightarrow 30\text{ cm}$.
   * Verification: Transitions strictly trigger at $150\text{ cm}$, $100\text{ cm}$, and $50\text{ cm}$.
2. **Step 2 (Retreating Hazard):**
   * Distance moves: $30\text{ cm} \rightarrow 52\text{ cm} \rightarrow 55\text{ cm} \rightarrow 103\text{ cm} \rightarrow 106\text{ cm} \rightarrow 155\text{ cm}$.
   * Verification:
     * Remains `CRITICAL` at $52\text{ cm}$ (within 4cm hysteresis band).
     * Transitions to `WARNING` at $55\text{ cm}$ ($> 50 + 4\text{ cm}$).
     * Remains `WARNING` at $103\text{ cm}$.
     * Transitions to `CAUTION` at $106\text{ cm}$ ($> 100 + 4\text{ cm}$).
     * Transitions to `SAFE` at $155\text{ cm}$ ($> 150 + 4\text{ cm}$).
