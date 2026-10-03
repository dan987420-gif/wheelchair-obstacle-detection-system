#ifndef ARDUINOJSON_H_STUB
#define ARDUINOJSON_H_STUB

#include <Arduino.h>

class JsonDocumentProxy {
public:
    template<typename T>
    void operator=(const T&) {}
};

template <size_t N>
class StaticJsonDocument {
public:
    template<typename K>
    JsonDocumentProxy operator[](K) { return JsonDocumentProxy(); }
};

template<typename T>
inline void serializeJson(T& doc, String& out) {}

#endif // ARDUINOJSON_H_STUB
