import React from 'react';
import DistanceGauge from '../components/DistanceGauge';
import ActuatorStatus from '../components/ActuatorStatus';
import LiveGraph from '../components/LiveGraph';
import { Cloud, Radio, RefreshCw } from 'lucide-react';

export default function LiveMonitorPage({ telemetry, history, settings, dataSourceMode, setDataSourceMode, refreshThingSpeak }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Telemetry Stream Data Source Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {dataSourceMode === 'THINGSPEAK' ? (
            <Cloud size={22} style={{ color: 'var(--primary-color)' }} />
          ) : (
            <Radio size={22} style={{ color: '#10b981' }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Data Stream Source: {dataSourceMode === 'THINGSPEAK' ? 'ThingSpeak Cloud (Channel 3519643)' : 'Local / Simulation WebSocket'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {dataSourceMode === 'THINGSPEAK'
                ? 'Refreshing every 16 seconds from ThingSpeak Cloud API'
                : 'Real-time high-throughput local hardware/simulation feed'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {dataSourceMode === 'THINGSPEAK' && refreshThingSpeak && (
            <button
              onClick={refreshThingSpeak}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--primary-color)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <RefreshCw size={14} /> Refresh Now
            </button>
          )}

          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setDataSourceMode && setDataSourceMode('LOCAL')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: dataSourceMode === 'LOCAL' ? 'var(--primary-color)' : 'transparent',
                color: dataSourceMode === 'LOCAL' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              LOCAL / SIMULATION
            </button>

            <button
              onClick={() => setDataSourceMode && setDataSourceMode('THINGSPEAK')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: dataSourceMode === 'THINGSPEAK' ? 'var(--primary-color)' : 'transparent',
                color: dataSourceMode === 'THINGSPEAK' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              THINGSPEAK CLOUD
            </button>
          </div>
        </div>
      </div>

      {/* Huge Live Monitor Proximity Gauge */}
      <DistanceGauge
        distanceCm={telemetry.distanceCm}
        riskLevel={telemetry.riskLevel}
        sensorStatus={telemetry.sensorStatus}
        size="large"
      />

      {/* Actuator States */}
      <ActuatorStatus
        actuators={telemetry.actuators}
        riskLevel={telemetry.riskLevel}
        distanceCm={telemetry.distanceCm}
        sensorStatus={telemetry.sensorStatus}
      />

      {/* Waveform Graph */}
      <LiveGraph history={history} settings={settings} />

    </div>
  );
}
