#ifndef HTTPCLIENT_H_STUB
#define HTTPCLIENT_H_STUB

#include <Arduino.h>

class HTTPClient {
public:
    void begin(const String&) {}
    void addHeader(const String&, const String&) {}
    void setTimeout(uint16_t) {}
    int POST(const String&) { return 200; }
    int GET() { return 200; }
    String getString() { return "1"; }
    void end() {}
};

#endif // HTTPCLIENT_H_STUB
