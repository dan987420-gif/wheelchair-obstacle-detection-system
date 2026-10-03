#ifndef WIFI_H_STUB
#define WIFI_H_STUB

#include <Arduino.h>

#define WIFI_STA 1
#define WL_CONNECTED 3

class WiFiClass {
public:
    void mode(int) {}
    void begin(const char*, const char*) {}
    int status() { return WL_CONNECTED; }
    String localIP() { return "127.0.0.1"; }
    int RSSI() { return -50; }
};

extern WiFiClass WiFi;

#endif // WIFI_H_STUB
