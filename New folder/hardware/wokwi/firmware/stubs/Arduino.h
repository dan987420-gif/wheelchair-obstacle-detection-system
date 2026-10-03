#ifndef ARDUINO_H_STUB
#define ARDUINO_H_STUB

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
#include <math.h>

class String {
public:
    String() {}
    String(const char* s) {}
    String(int v) {}
    String(float v, int dec = 2) {}
    String(unsigned long v) {}
    String(double v, int dec = 2) {}

    String operator+(const String& o) const { return String(); }
    String operator+(const char* s) const { return String(); }
    String& operator+=(const String& o) { return *this; }
    String& operator+=(const char* s) { return *this; }

    bool operator==(const char* s) const { return true; }
    bool operator!=(const char* s) const { return false; }
    bool operator==(const String& s) const { return true; }
    bool operator!=(const String& s) const { return false; }

    const char* c_str() const { return ""; }
};

inline String operator+(const char* lhs, const String& rhs) { return String(); }

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
    void print(const String&) {}
    void print(float, int = 2) {}
    void println(const char* = "") {}
    void println(const String&) {}
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

#include <cmath>
inline double round(double x) { return std::round(x); }
inline float round(float x) { return std::round(x); }

#endif // ARDUINO_H_STUB
