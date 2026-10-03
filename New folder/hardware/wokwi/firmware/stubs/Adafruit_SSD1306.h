#ifndef ADAFRUIT_SSD1306_H_STUB
#define ADAFRUIT_SSD1306_H_STUB

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>

#define SSD1306_SWITCHCAPVCC 0x2
#define SSD1306_WHITE 1

class Adafruit_SSD1306 : public Adafruit_GFX {
public:
    Adafruit_SSD1306(uint16_t w, uint16_t h, TwoWire *t = &Wire, int8_t r = -1) : Adafruit_GFX(w, h) {}
    bool begin(uint8_t switchvcc = SSD1306_SWITCHCAPVCC, uint8_t i2caddr = 0) { return true; }
    void clearDisplay() {}
    void setTextSize(uint8_t s) {}
    void setTextColor(uint16_t c) {}
    void setCursor(int16_t x, int16_t y) {}
    void print(const char*) {}
    void print(float, int = 2) {}
    void print(const String&) {}
    void println(const char* = "") {}
    void println(const String&) {}
    void drawLine(int16_t x0, int16_t y0, int16_t x1, int16_t y1, uint16_t color) {}
    void display() {}
};

#endif // ADAFRUIT_SSD1306_H_STUB
