# Viva Voce & Technical Examination Preparation (30 Questions & Answers)

**Project Title:** Wheelchair Obstacle Detection System  
**Subject:** Embedded Systems, IoT, Sensors & Transducers, Full-Stack Software Engineering  

---

### Q1: What is the HC-SR04 ultrasonic sensor and how does it measure distance?
**Answer:** The HC-SR04 is an ultrasonic distance transducer operating at 40 kHz. It consists of an ultrasonic transmitter and receiver. A 10µs HIGH trigger pulse causes the transmitter to emit an 8-cycle acoustic sonic burst. When the wave reflects off an obstacle, the ECHO pin goes HIGH for a duration proportional to the sound's round-trip travel time. Distance in centimeters is calculated as:
$$\text{Distance (cm)} = \frac{\text{Duration (µs)} \times 0.0343}{2}$$

---

### Q2: Why is the speed of sound constant taken as 0.0343 cm/µs?
**Answer:** The speed of sound in dry air at room temperature (~20°C) is approximately $343\text{ m/s}$. Converting units:
$$\frac{343\text{ m}}{1\text{ s}} = \frac{34,300\text{ cm}}{1,000,000\text{ µs}} = 0.0343\text{ cm/µs}$$
We divide by 2 because the measured time represents the round trip (sensor to obstacle and back).

---

### Q3: Why did you choose the ESP32 microcontroller over an Arduino Uno?
**Answer:** The ESP32 features a dual-core Xtensa 32-bit LX6 processor running at 240 MHz, built-in 802.11 b/g/n Wi-Fi and Bluetooth, ample flash/SRAM, and hardware timers. This enables bare-metal deterministic sensor sampling while simultaneously executing IoT networking (HTTP/WebSocket telemetry) without CPU stalling.

---

### Q4: Why is local hardware warning independent of the backend server?
**Answer:** In assistive safety applications, reliability and latency are critical. Network connections can experience packet drops, router downtime, or server latency. Executing the risk engine and actuators directly in bare-metal ESP32 C++ guarantees sub-10ms response times even when offline.

---

### Q5: What is sensor noise filtering and why is a median filter used?
**Answer:** Ultrasonic waves can occasionally suffer specular reflection, acoustic multipath, or random spikes (e.g. reading 150cm when actual distance is 30cm). A 5-point circular buffer median filter rejects single-sample outliers without adding significant phase delay, preventing false alarms.

---

### Q6: What is hysteresis and why is it important in obstacle detection?
**Answer:** Hysteresis introduces a buffer band (e.g. 4 cm) between state thresholds. If an obstacle is hovering near a 100 cm boundary, small millimeter sensor fluctuations would cause annoying, rapid flickering between CAUTION and WARNING. Hysteresis requires the obstacle to move beyond $100\text{ cm} + 4\text{ cm} = 104\text{ cm}$ before relaxing the warning state.

---

### Q7: Why did you implement multi-modal warnings (Visual, Audio, Tactile)?
**Answer:** Wheelchair users may have diverse sensory abilities. Visually impaired users rely heavily on acoustic beeps and tactile vibration in the armrest; hearing-impaired users rely on bright LED indicators and haptic vibration. Multi-modal alerts provide redundant sensory channels.

---

### Q8: How is the vibration motor driven in physical hardware?
**Answer:** ESP32 GPIO pins supply a maximum of 12mA, whereas a standard coin or cylindrical vibration motor draws 50mA–100mA. In physical hardware, a 2N2222 NPN transistor or MOSFET switch with a 1kΩ base resistor and a 1N4001 flyback diode is used to safely switch power from the 3.3V/5V rail.

---

### Q9: Why are non-blocking timers (`millis()`) used in firmware instead of `delay()`?
**Answer:** Using `delay()` halts CPU execution, preventing the ultrasonic sensor from measuring distance during tone generation. Using `millis()` state checks allows the buzzer and vibration patterns to blink and pulse asynchronously while the sensor continues sampling every 100ms.

---

### Q10: What is the structured JSON protocol used over Serial?
**Answer:** To prevent debug print messages from corrupting software parsers, telemetry lines are prefixed with `DATA:` and formatted as JSON Lines:
```text
DATA:{"deviceId":"WC-001","distanceCm":42.5,"riskLevel":"CRITICAL"}
DEBUG:WiFi Connected
```

---

### Q11: How does the backend prevent database flooding during continuous obstacles?
**Answer:** The Event Manager uses an incident grouping engine. When risk enters CAUTION/WARNING/CRITICAL, it opens an active incident. Subsequent readings update the minimum distance reached. When distance returns to SAFE, it marks the end time and records total duration, storing only one consolidated record.

---

### Q12: Why use WebSockets instead of HTTP polling for the dashboard?
**Answer:** WebSockets maintain a persistent, full-duplex TCP socket, allowing the backend to push telemetry frames immediately (<10ms) upon reception. Polling introduces network overhead and delays equal to the polling interval.

---

### Q13: What happens when the sensor disconnects or times out?
**Answer:** If `pulseIn` returns 0 microseconds (timeout limit: 25ms / ~430cm) for 5 consecutive cycles, the system sets status to `SENSOR_ERROR` and `RISK_UNKNOWN`. It activates an alternating LED alert rather than assuming the path is `SAFE`.

---

### Q14: How are safety thresholds configured and validated?
**Answer:** Thresholds are managed through `GET` and `PATCH /api/v1/settings`. The safety engine strictly validates that:
$$\text{Safe} > \text{Caution} > \text{Warning} \ge \text{Critical} > 0$$
Invalid configurations are rejected with a 400 Bad Request.

---

### Q15: Why is a Software Simulation mode included?
**Answer:** Simulation mode allows comprehensive testing of all dashboard HUDs, audio synthesizers, event lifecycles, and CSV exports in environments where physical hardware or Wokwi networking is inaccessible during presentations or viva exams.

---

### Q16: What is the effective field-of-view of the HC-SR04?
**Answer:** The HC-SR04 has an effective beam angle of approximately 15° to 30°. Objects outside this central cone are not detected.

---

### Q17: What are the limitations of ultrasonic sensing?
**Answer:** Acoustic sensing is sensitive to sound-absorbing soft materials (heavy coats, foam), acoustic reflections from sharp angled walls, and extreme ambient temperature fluctuations affecting sound speed.

---

### Q18: Is this system a certified medical device?
**Answer:** No. It is an educational engineering prototype designed to demonstrate proximity assistance. It does not replace certified mobility equipment.

---

### Q19: How can real hardware replace the Wokwi simulation?
**Answer:** Real hardware flashes the exact same Arduino/ESP32 C++ firmware (`hardware/wokwi/firmware/main.ino`), uses the same GPIO pinout, connects to local Wi-Fi, and transmits to the exact same REST endpoint (`/api/v1/sensor/readings`).

---

### Q20: What database is used and what tables exist?
**Answer:** An embedded persistent SQLite relational schema containing `devices`, `sensor_readings`, `obstacle_events`, `system_settings`, and `device_status`.

---

### Q21: What role does the SSD1306 OLED display serve?
**Answer:** The OLED provides a local instrument cluster mounted on the wheelchair handlebar, displaying distance in centimeters, current risk level, and sensor status independently of any external computer.

---

### Q22: What is the purpose of the device heartbeat?
**Answer:** The ESP32 sends periodic status pings. If no reading or heartbeat arrives within 15 seconds, the dashboard marks the device status as `OFFLINE` with a gray badge instead of showing stale data.

---

### Q23: How does the system handle sensor readings of negative distance or NaN?
**Answer:** The validation middleware checks `isNaN(dist)` and ensures distance is within physical boundaries (2cm to 400cm). Malformed packets are rejected with descriptive error codes without crashing the server.

---

### Q24: What is CORS and why is it configured?
**Answer:** Cross-Origin Resource Sharing (CORS) headers allow the React frontend running on port 3000 to securely send requests to the Express backend API running on port 5000.

---

### Q25: How does the dashboard provide accessible audio alerts?
**Answer:** Using the browser's Web Audio API, the dashboard synthesizes acoustic beeps (880Hz for Critical, 587Hz for Warning) with a user-controlled Mute/Unmute button in compliance with modern browser autoplay policies.

---

### Q26: What is the sample interval and telemetry interval?
**Answer:** The sensor is sampled locally every 100ms for responsiveness; telemetry is streamed to the backend every 500ms or immediately whenever a risk level transition occurs.

---

### Q27: How can multiple sensors (front, left, right, rear) be added in the future?
**Answer:** The backend data model includes `sensorType` and is extensible to `sensorPosition` (e.g. `FRONT`, `LEFT_SIDE`, `REAR`). The ESP32 can multiplex additional trigger/echo pins or use an I2C distance array (such as VL53L0X ToF sensors).

---

### Q28: How does the CSV export work?
**Answer:** `GET /api/v1/obstacle-events/export/csv` queries the SQLite database, serializes event records with headers, and streams the response with `Content-Type: text/csv` and `Content-Disposition: attachment`.

---

### Q29: What design tokens are used for UI aesthetics?
**Answer:** A dark-mode theme (`#0a0e17`) with glassmorphic cards (`backdrop-filter: blur(16px)`), high-contrast accessible typography (Inter & Outfit fonts), and pulsing neon alert glow animations.

---

### Q30: What is the main engineering takeaway of this project?
**Answer:** Demonstrating a complete, robust, full-stack IoT safety architecture that pairs bare-metal autonomous embedded control with real-time web telemetry and analytics.
