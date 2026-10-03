# Project Demonstration Guide (3–5 Minute Evaluator Walkthrough)

**Project Title:** Wheelchair Obstacle Detection System  
**Audience:** College Project Evaluators, Viva Examiners, and Hackathon Judges  

---

## 1. Demonstration Checklist Before You Begin

1. **Backend Server Running:**
   ```bash
   cd backend
   npm start
   # Confirms: HTTP Server at :5000, WebSocket at :5000/ws
   ```
2. **Frontend Dashboard Running:**
   ```bash
   cd frontend
   npm run dev
   # Opens: http://localhost:3000
   ```
3. **Hardware Simulation Ready:**
   * Open Wokwi simulation in browser or VS Code using `hardware/wokwi/diagram.json` and `hardware/wokwi/firmware/main.ino`.
   * Alternatively, use the built-in **Simulation Mode** on the frontend dashboard.

---

## 2. Timed 5-Minute Demonstration Script

### Minute 0:00 – 0:45: Problem Statement & Engineering Purpose
* **Show:** Main Dashboard at `http://localhost:3000`.
* **Explain:** 
  > *"Wheelchair operators navigating crowded or dim environments face forward blind spots and collision risks. Our system integrates an ultrasonic distance sensor (HC-SR04) with an ESP32 microcontroller to provide immediate, multi-modal feedback (Visual LEDs, Acoustic Buzzer, Tactile Vibration) and an IoT real-time monitoring dashboard for attendants."*

---

### Minute 0:45 – 1:45: Architecture & Autonomous Local Safety Loop
* **Show:** Click the **Architecture & Docs** tab or point to `docs/architecture.md`.
* **Explain:**
  > *"A critical safety principle of our design is that the ESP32 bare-metal firmware runs 100% autonomously. Even if the network drops or the server is turned off, the hardware reacts in under 10 milliseconds to physical obstacles."*
* **Show:** Pinout table: TRIG (GPIO 5), ECHO (GPIO 18), Green (GPIO 25), Yellow (GPIO 26), Red (GPIO 27), Buzzer (GPIO 14), Vibration (GPIO 12), OLED I2C (GPIO 21/22).

---

### Minute 1:45 – 3:30: Live 4-Tier Threshold & Actuator Demonstration
Switch to the **Simulation Mode** or Wokwi:

1. **Test 1: SAFE (> 150 cm)**
   * Set slider or Wokwi distance to **200 cm**.
   * **Observe:** Green LED ON, Buzzer Silent, Vibration Silent, Proximity HUD displays Green SAFE badge.
2. **Test 2: CAUTION (100 – 150 cm)**
   * Set distance to **125 cm**.
   * **Observe:** Yellow LED solid ON, Slow acoustic chirp (every 1.5s), Gentle vibration pulse, HUD switches to Yellow CAUTION.
3. **Test 3: WARNING (50 – 100 cm)**
   * Set distance to **75 cm**.
   * **Observe:** Yellow LED flashing, Medium beep (every 500ms), Medium haptic vibration pulse, HUD switches to Orange WARNING.
4. **Test 4: CRITICAL HAZARD (&le; 50 cm)**
   * Set distance to **30 cm**.
   * **Observe:** Emergency Red LED solid ON, Rapid 100ms Siren alarm, Continuous haptic vibration alert, Top red emergency banner triggers with audio warning.
5. **Test 5: Obstacle Clearance**
   * Move distance back to **200 cm**.
   * **Observe:** System instantly recovers to SAFE; Obstacle event closes automatically.

---

### Minute 3:30 – 4:15: Obstacle Incident Logging & Analytics
* **Show:** Click the **Obstacle Events** tab.
* **Explain:**
  > *"Notice that consecutive critical readings did not spam hundreds of duplicate records. The backend grouping engine consolidated the hazard encounter into one continuous event, recording the start time, end time, 7-second duration, and the minimum 30cm proximity reached."*
* **Demonstrate:** Click **Export CSV** to show instant data download.

---

### Minute 4:15 – 5:00: Dynamic Threshold Settings & Limitations
* **Show:** Click **Safety Thresholds** tab.
* **Demonstrate:** Adjusting Safe distance from 150cm to 180cm, show client-side and server-side hierarchy validation.
* **Conclude:**
  > *"In summary, the prototype demonstrates an end-to-end IoT safety pipeline from raw ultrasonic pulses to multi-modal feedback and cloud analytics."*
