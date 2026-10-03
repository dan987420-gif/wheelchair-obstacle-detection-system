# Hardware Execution Flow & State Machine

**Project:** Wheelchair Obstacle Detection System

---

## 1. Local Safety Loop Sequence

```text
               +------------------------------------+
               |           POWER-ON BOOT            |
               | - Initialize GPIO, OLED & WiFi     |
               | - Execute Hardware Self-Test (500ms)|
               +-----------------+------------------+
                                 |
                                 v
        +--------------------------------------------------+
        |                 MONITORING LOOP                  |
        | - Check WiFi status in background (non-blocking) |
        | - Read Timer tick                                |
        +------------------------+-------------------------+
                                 |
           Every 100ms           |
        +------------------------+
        |
        v
+---------------------------------------------------+
|               ULTRASONIC SENSING                  |
| 1. Send 10µs pulse to TRIG (GPIO 5)               |
| 2. Measure ECHO pulse duration on GPIO 18         |
| 3. Raw Distance = (duration_µs * 0.0343) / 2      |
| 4. Circular buffer 5-point median noise filtering |
+------------------------+--------------------------+
                         |
                         v
+---------------------------------------------------+
|            RISK EVALUATION & HYSTERESIS           |
| - Check against SAFE, CAUTION, WARNING, CRITICAL  |
| - Apply 4cm hysteresis to prevent edge flicker    |
+------------------------+--------------------------+
                         |
                         v
+---------------------------------------------------+
|           LOCAL MULTI-MODAL ACTUATION             |
| - SAFE:     Green LED ON, Buzzer/Vib OFF          |
| - CAUTION:  Yellow LED ON, Slow beep (1.5s)       |
| - WARNING:  Yellow LED Blink, Med beep (500ms)    |
| - CRITICAL: Red LED ON, Rapid alarm, Rapid vib    |
| - OLED: Real-time HUD refresh                     |
+------------------------+--------------------------+
                         |
      State Transition OR| Every 500ms
                         v
+---------------------------------------------------+
|               DATA TRANSMISSION                   |
| 1. Stream JSON Lines to Serial (DATA:{...})       |
| 2. HTTP POST JSON payload to Backend REST API     |
+---------------------------------------------------+
```

---

## 2. Multi-Modal Alert Matrix

| Risk State | Distance Range | Green LED | Yellow LED | Red LED | Piezo Buzzer | Vibration Motor | OLED Status Line |
|---|---|---|---|---|---|---|---|
| **SAFE** | > 150 cm | **ON** | OFF | OFF | OFF | OFF | `Risk: SAFE` |
| **CAUTION** | 100 – 150 cm | OFF | **ON** | OFF | Slow Beep (1.5s) | Gentle Pulse (1.5s) | `Risk: CAUTION` |
| **WARNING** | 50 – 100 cm | OFF | **Blinking (250ms)** | OFF | Medium Beep (500ms) | Medium Pulse (500ms) | `Risk: WARNING` |
| **CRITICAL** | <= 50 cm | OFF | OFF | **ON** | Rapid Siren (100ms) | Continuous Pulse (150ms) | `! CRITICAL OBSTACLE !` |
| **ERROR** | Sensor Timeout | OFF | **Alt. Blink** | **Alt. Blink** | Double Chirp | OFF | `Sensor: TIMEOUT` |
