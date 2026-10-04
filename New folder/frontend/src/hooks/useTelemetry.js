import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState({
    distanceCm: 200,
    riskLevel: 'SAFE',
    sensorStatus: 'ONLINE',
    sensorType: 'HC-SR04',
    source: 'STANDBY',
    deviceId: 'WC-001',
    timestamp: new Date().toISOString(),
    isOnline: false,
    rssi: -50,
    actuators: {
      buzzer: false,
      vibration: false,
      led: 'GREEN'
    }
  });

  const [history, setHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('CONNECTING'); // 'CONNECTED', 'DISCONNECTED', 'CONNECTING'
  const [activeAlert, setActiveAlert] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [settings, setSettings] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const lastSoundPlayedRef = useRef(0);

  // Play synthetic web audio alert tones when enabled
  const playAlertTone = useCallback((risk) => {
    if (!audioEnabled) return;
    const now = Date.now();
    
    // Throttle tone generation
    if (risk === 'CRITICAL' && now - lastSoundPlayedRef.current >= 200) {
      lastSoundPlayedRef.current = now;
      try {
        const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 High Warning Pitch
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {
        // Browser audio policy suppression
      }
    } else if (risk === 'WARNING' && now - lastSoundPlayedRef.current >= 500) {
      lastSoundPlayedRef.current = now;
      try {
        const ctx = audioContextRef.current || new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 Warning
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {
        // Browser audio policy suppression
      }
    }
  }, [audioEnabled]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.warn('[Telemetry] Could not load initial settings:', err.message);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.host}/ws`;


    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('CONNECTED');
        console.log('[WS] Connected to live telemetry stream');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'SENSOR_READING') {
            const { reading, status, eventChange } = message.data;

            setTelemetry({
              distanceCm: reading.distance_cm,
              riskLevel: reading.risk_level,
              sensorStatus: status?.sensor_status || (reading.distance_cm < 0 ? 'ERROR' : 'OK'),
              sensorType: reading.sensor_type,
              source: reading.source,
              deviceId: reading.device_id,
              timestamp: reading.recorded_at,
              isOnline: true,
              rssi: status?.wifi_rssi || -45,
              actuators: {
                buzzer: status?.buzzer_status ?? (reading.risk_level === 'WARNING' || reading.risk_level === 'CRITICAL'),
                vibration: status?.vibration_status ?? (reading.risk_level !== 'SAFE' && reading.risk_level !== 'UNKNOWN'),
                led: status?.led_status ?? (reading.risk_level === 'CRITICAL' ? 'RED' : (reading.risk_level === 'WARNING' ? 'YELLOW_BLINKING' : (reading.risk_level === 'CAUTION' ? 'YELLOW' : 'GREEN')))
              }
            });

            // Append to rolling live history (last 60 points)
            setHistory((prev) => {
              const updated = [...prev, {
                time: new Date(reading.recorded_at).toLocaleTimeString(),
                distance: reading.distance_cm,
                risk: reading.risk_level
              }];
              return updated.slice(-60);
            });

            // Play audio alert tone
            playAlertTone(reading.risk_level);

            // Banner alert trigger on critical
            if (reading.risk_level === 'CRITICAL') {
              setActiveAlert({
                id: Date.now(),
                risk: 'CRITICAL',
                distanceCm: reading.distance_cm,
                message: `CRITICAL OBSTACLE DETECTED at ${reading.distance_cm} cm! Immediate attention required.`
              });
            }
          } else if (message.type === 'SETTINGS_UPDATE') {
            setSettings(message.data);
          }
        } catch (e) {
          console.error('[WS] Parse error:', e.message);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('DISCONNECTED');
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 2500);
      };

      ws.onerror = () => {
        setConnectionStatus('DISCONNECTED');
        ws.close();
      };
    } catch (err) {
      setConnectionStatus('DISCONNECTED');
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    }
  }, [playAlertTone]);

  const [dataSourceMode, setDataSourceMode] = useState('THINGSPEAK'); // Default to 'THINGSPEAK' cloud stream

  // Fetch ThingSpeak telemetry periodically when THINGSPEAK mode is active
  const fetchThingSpeakData = useCallback(async () => {
    try {
      const latestRes = await api.getThingSpeakLatest();
      if (latestRes.success && latestRes.data) {
        const item = latestRes.data;
        setTelemetry({
          distanceCm: item.distanceCm,
          riskLevel: item.riskLevel,
          sensorStatus: item.sensorStatus,
          sensorType: item.sensorType,
          source: 'THINGSPEAK_CLOUD',
          deviceId: item.deviceId,
          timestamp: item.timestamp,
          isOnline: true,
          rssi: item.rssi,
          actuators: item.actuators
        });

        playAlertTone(item.riskLevel);

        if (item.riskLevel === 'CRITICAL') {
          setActiveAlert({
            id: Date.now(),
            risk: 'CRITICAL',
            distanceCm: item.distanceCm,
            message: `CRITICAL OBSTACLE DETECTED on ThingSpeak at ${item.distanceCm} cm!`
          });
        }
      }

      const feedsRes = await api.getThingSpeakFeeds(60);
      if (feedsRes.success && Array.isArray(feedsRes.data)) {
        setHistory(feedsRes.data);
      }
    } catch (err) {
      console.warn('[ThingSpeak Telemetry] Cloud fetch warning:', err.message);
    }
  }, [playAlertTone]);

  useEffect(() => {
    if (dataSourceMode === 'THINGSPEAK') {
      fetchThingSpeakData();
      const tsInterval = setInterval(fetchThingSpeakData, 16000); // 16s ThingSpeak refresh rate
      return () => clearInterval(tsInterval);
    }
  }, [dataSourceMode, fetchThingSpeakData]);

  // Initial setup and fallback polling
  useEffect(() => {
    loadSettings();
    connectWebSocket();

    // Fallback polling interval to check server latest readings if WS is disconnected
    const pollingInterval = setInterval(async () => {
      if (connectionStatus !== 'CONNECTED' && dataSourceMode === 'LOCAL') {
        try {
          const res = await api.getLatestReading();
          if (res.success && res.data) {
            setTelemetry((prev) => ({
              ...prev,
              distanceCm: res.data.distance_cm,
              riskLevel: res.data.risk_level,
              timestamp: res.data.recorded_at,
              source: res.data.source
            }));
          }
        } catch (e) {
          // Silent polling retry
        }
      }
    }, 4000);

    return () => {
      clearInterval(pollingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket, loadSettings, connectionStatus, dataSourceMode]);

  const dismissAlert = () => setActiveAlert(null);
  const toggleAudio = () => setAudioEnabled(prev => !prev);

  return {
    telemetry,
    history,
    connectionStatus,
    activeAlert,
    dismissAlert,
    audioEnabled,
    toggleAudio,
    settings,
    reloadSettings: loadSettings,
    dataSourceMode,
    setDataSourceMode,
    refreshThingSpeak: fetchThingSpeakData
  };
}

