#ifndef Arduino_h
#define Arduino_h
#ifndef ARDUINO_H
#define ARDUINO_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
#include <math.h>
#include <cmath>

#define String ArduinoString

class ArduinoString {
public:
    ArduinoString() {}
    ArduinoString(const char* s) {}
    ArduinoString(int v) {}
    ArduinoString(float v, int dec = 2) {}
    ArduinoString(unsigned long v) {}
    ArduinoString(double v, int dec = 2) {}

    ArduinoString operator+(const ArduinoString& o) const { return ArduinoString(); }
    ArduinoString operator+(const char* s) const { return ArduinoString(); }
    ArduinoString& operator+=(const ArduinoString& o) { return *this; }
    ArduinoString& operator+=(const char* s) { return *this; }

    bool operator==(const char* s) const { return true; }
    bool operator!=(const char* s) const { return false; }
    bool operator==(const ArduinoString& s) const { return true; }
    bool operator!=(const ArduinoString& s) const { return false; }

    const char* c_str() const { return ""; }
};

inline ArduinoString operator+(const char* lhs, const ArduinoString& rhs) { return ArduinoString(); }

#define HIGH 0x1
#define LOW  0x0
#define INPUT 0x0
#define OUTPUT 0x1
#define INPUT_PULLUP 0x2

#define F(string_literal) string_literal

class HardwareSerial {
public:
    void begin(unsigned long baud) {}
    void print(const char*) {}
    void print(const ArduinoString&) {}
    void print(float, int = 2) {}
    void println(const char* = "") {}
    void println(const ArduinoString&) {}
    void println(float, int = 2) {}
};
extern HardwareSerial Serial;

inline unsigned long millis() { return 0; }
inline void delay(unsigned long) {}
inline void delayMicroseconds(unsigned int) {}
inline unsigned long pulseIn(uint8_t, uint8_t, unsigned long = 1000000L) { return 0; }
inline void pinMode(uint8_t, uint8_t) {}
inline void digitalWrite(uint8_t, uint8_t) {}
inline int digitalRead(uint8_t) { return 0; }
inline void yield() {}

inline double round(double x) { return std::round(x); }
inline float round(float x) { return std::round(x); }

#endif // ARDUINO_H
#endif // Arduino_h
