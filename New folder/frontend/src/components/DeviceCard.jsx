import React from 'react';
import { Cpu, Wifi, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';

export default function DeviceCard({ telemetry }) {
  const {
    deviceId = 'WC-001',
    sensorType = 'HC-SR04',
    sensorStatus = 'OK',
    source = 'WOKWI',
    timestamp,
    isOnline,
    rssi = -50
  } = telemetry || {};

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={20} color="#06b6d4" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            Microcontroller &amp; Hardware Node
          </h3>
        </div>

        <span className={`badge ${isOnline ? 'badge-safe' : 'badge-offline'}`}>
          {isOnline ? 'HARDWARE ONLINE' : 'OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        
        {/* Device ID */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Device Identifier
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
            {deviceId}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Wheelchair Prototype Node
          </div>
        </div>

        {/* Primary Sensor */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Primary Distance Sensor
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
            {sensorType}
          </div>
          <div style={{ fontSize: '0.7rem', color: sensorStatus === 'OK' ? '#10b981' : '#ef4444' }}>
            Status: {sensorStatus}
          </div>
        </div>

        {/* Firmware Version */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Firmware Version
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
            v1.0.0 (ESP32)
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Autonomous Local Safety Loop
          </div>
        </div>

        {/* WiFi & RSSI */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Wi-Fi Signal Strength
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            <Wifi size={18} />
            <span>{rssi} dBm</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            Source: {source}
          </div>
        </div>

      </div>

      {/* Last Seen Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <Clock size={14} />
        <span>Last telemetry heartbeat received: {timestamp ? new Date(timestamp).toLocaleString() : 'Awaiting data'}</span>
      </div>
    </div>
  );
}
