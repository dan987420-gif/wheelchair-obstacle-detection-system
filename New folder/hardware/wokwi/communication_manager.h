/**
 * @file communication_manager.h
 * @brief Serial JSON Lines Telemetry & Wi-Fi REST API Client
 */

#ifndef COMMUNICATION_MANAGER_H
#define COMMUNICATION_MANAGER_H

#include <Arduino.h>
#include "config.h"
#include "safety_manager.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

class CommunicationManager {
private:
  unsigned long lastWifiRetry;
  unsigned long lastTelemetrySend;
  unsigned long lastHeartbeatSend;
  unsigned long lastThingSpeakSend;
  bool wifiConnected;
  String backendUrl;
  String heartbeatUrl;

public:
  CommunicationManager()
      : lastWifiRetry(0), lastTelemetrySend(0), lastHeartbeatSend(0),
        lastThingSpeakSend(0), wifiConnected(false),
        backendUrl(String(DEFAULT_BACKEND_HOST) + SENSOR_READINGS_ENDPOINT),
        heartbeatUrl(String(DEFAULT_BACKEND_HOST) + DEVICE_HEARTBEAT_ENDPOINT) {
  }

  void begin() {
    Serial.println(F("DEBUG:Initializing WiFi subsystem..."));
    WiFi.mode(WIFI_STA);
    connectWifi();
  }

  void connectWifi() {
    Serial.print(F("DEBUG:Attempting connection to SSID: "));
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  void setBackendHost(const String &host) {
    backendUrl = host + SENSOR_READINGS_ENDPOINT;
    heartbeatUrl = host + DEVICE_HEARTBEAT_ENDPOINT;
  }

  void checkConnection(unsigned long now) {
    if (WiFi.status() == WL_CONNECTED) {
      if (!wifiConnected) {
        wifiConnected = true;
        Serial.print(F("DEBUG:WiFi Connected! IP Address: "));
        Serial.println(WiFi.localIP());
      }
    } else {
      if (wifiConnected) {
        wifiConnected = false;
        Serial.println(
            F("DEBUG:WiFi connection lost. Will retry in background..."));
      }
      if (now - lastWifiRetry >= WIFI_RECONNECT_INTERVAL_MS) {
        lastWifiRetry = now;
        connectWifi();
      }
    }
  }

  /**
   * @brief Formats and prints structured JSON telemetry to Serial.
   * Prefix DATA: allows software tools to reliably parse without debug noise.
   */
  void printSerialData(float distanceCm, RiskLevel risk,
                       const char *sensorStatus, bool buzzer, bool vibration,
                       const char *led) {
    StaticJsonDocument<384> doc;
    doc["protocolVersion"] = PROTOCOL_VERSION;
    doc["deviceId"] = DEVICE_ID;
    doc["sensorType"] = "HC-SR04";
    doc["distanceCm"] =
        (distanceCm >= 0) ? round(distanceCm * 10.0f) / 10.0f : -1.0f;
    doc["riskLevel"] = SafetyManager::riskToString(risk);
    doc["sensorStatus"] = sensorStatus;
    doc["buzzer"] = buzzer;
    doc["vibration"] = vibration;
    doc["led"] = led;
    doc["source"] = DATA_SOURCE_WOKWI;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["wifiRssi"] = (wifiConnected) ? WiFi.RSSI() : 0;
    doc["timestamp"] = millis();

    String jsonString;
    serializeJson(doc, jsonString);

    Serial.print(F("DATA:"));
    Serial.println(jsonString);
  }

  /**
   * @brief Transmits sensor telemetry to Backend REST API via HTTP POST.
   */
  bool sendTelemetry(float distanceCm, RiskLevel risk, const char *sensorStatus,
                     bool buzzer, bool vibration, const char *led) {
    if (WiFi.status() != WL_CONNECTED) {
      return false;
    }

    HTTPClient http;
    http.begin(backendUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(800); // Strict short timeout so hardware loop is never stalled

    StaticJsonDocument<384> doc;
    doc["protocolVersion"] = PROTOCOL_VERSION;
    doc["deviceId"] = DEVICE_ID;
    doc["sensorType"] = "HC-SR04";
    doc["distanceCm"] =
        (distanceCm >= 0) ? round(distanceCm * 10.0f) / 10.0f : -1.0f;
    doc["riskLevel"] = SafetyManager::riskToString(risk);
    doc["sensorStatus"] = sensorStatus;
    doc["buzzer"] = buzzer;
    doc["vibration"] = vibration;
    doc["led"] = led;
    doc["source"] = DATA_SOURCE_WOKWI;
    doc["firmwareVersion"] = FIRMWARE_VERSION;
    doc["wifiRssi"] = WiFi.RSSI();

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);
    http.end();

    return (httpCode >= 200 && httpCode < 300);
  }

  bool sendToThingSpeak(float distanceCm, int riskValue, bool buzzer,
                        bool vibration, int ledStatus) {

    if (WiFi.status() != WL_CONNECTED) {
      return false;
    }
    unsigned long now = millis();

    if (now - lastThingSpeakSend < THINGSPEAK_INTERVAL_MS) {
      return false;
    }

    lastThingSpeakSend = now;
    HTTPClient http;

    String url = String(THINGSPEAK_UPDATE_URL);
    url += "?api_key=" + String(THINGSPEAK_WRITE_API_KEY);
    url += "&field1=" + String(distanceCm, 1);
    url += "&field2=" + String(riskValue);
    url += "&field3=" + String(buzzer ? 1 : 0);
    url += "&field4=" + String(ledStatus);
    url += "&field5=" + String(vibration ? 1 : 0);

    http.begin(url);
    http.setTimeout(5000);

    int httpCode = http.GET();
    String response = http.getString();

    http.end();

    Serial.print(F("ThingSpeak HTTP Code: "));
    Serial.println(httpCode);

    Serial.print(F("ThingSpeak Response: "));
    Serial.println(response);

    return (httpCode == 200 && response != "0");
  }

  bool isWifiConnected() const { return wifiConnected; }
};

#endif // COMMUNICATION_MANAGER_H
