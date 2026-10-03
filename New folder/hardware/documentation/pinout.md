# Hardware Pinout & Wiring Specification

**Project:** Wheelchair Obstacle Detection System  
**Microcontroller:** ESP32 DevKit V4 (30/38 pin)

---

## 1. GPIO Pin Mapping Table

| Component | Pin Label | ESP32 GPIO | Direction | Function / Electrical Notes |
|---|---|---|---|---|
| **HC-SR04** | VCC | 5V / VIN | Power | Powered from 5V rail |
| **HC-SR04** | GND | GND | Power | Common ground |
| **HC-SR04** | TRIG | GPIO 5 | Output | 10µs High pulse triggers 40kHz ultrasonic burst |
| **HC-SR04** | ECHO | GPIO 18 | Input | Measures round-trip echo pulse duration |
| **Green LED** | Anode (+) | GPIO 25 | Output | SAFE state indicator (via 220Ω current-limiting resistor) |
| **Yellow LED** | Anode (+) | GPIO 26 | Output | CAUTION / WARNING state indicator (via 220Ω resistor) |
| **Red LED** | Anode (+) | GPIO 27 | Output | CRITICAL obstacle danger indicator (via 220Ω resistor) |
| **Piezo Buzzer**| Positive (+)| GPIO 14 | Output | Audio warning tones & beep sequences |
| **Vibration Motor**| Positive (+)| GPIO 12 | Output | Haptic tactile vibration alert (via transistor driver) |
| **SSD1306 OLED**| SDA | GPIO 21 | I2C Data | Local display data line (3.3V) |
| **SSD1306 OLED**| SCL | GPIO 22 | I2C Clock| Local display clock line (3.3V) |
| **SSD1306 OLED**| VCC | 3.3V | Power | Display logic power |
| **SSD1306 OLED**| GND | GND | Power | Common ground |

---

## 2. Real-World Hardware Wiring Considerations

### Vibration Motor Driver
In actual hardware deployment, a DC vibration motor draws between 50mA–100mA, which exceeds an ESP32 GPIO's maximum current rating of 12mA. A 2N2222 NPN transistor or 2N7000 MOSFET driver circuit with a 1N4001 flyback diode must be used:
- **ESP32 GPIO 12** -> 1kΩ Resistor -> Base/Gate of Transistor/MOSFET
- **Motor (+) -> 3.3V/5V Rail**
- **Motor (-) -> Collector/Drain**
- **Emitter/Source -> GND**
- **Flyback Diode across Motor terminals** to suppress inductive spikes.

### Ultrasonic Sensor Voltage Levels
The HC-SR04 ECHO pin typically outputs 5V logic. In physical hardware, a simple resistor voltage divider (1kΩ and 2kΩ) or 3.3V-compatible sensor module (like HC-SR04P or RCWL-1601) is recommended to protect the ESP32 3.3V input pins.
