import React from 'react';
import DistanceGauge from '../components/DistanceGauge';
import LiveGraph from '../components/LiveGraph';
import ActuatorStatus from '../components/ActuatorStatus';
import EventTable from '../components/EventTable';
import AnalyticsCards from '../components/AnalyticsCards';
import DeviceCard from '../components/DeviceCard';
import { Cloud, Radio, RefreshCw, Clock } from 'lucide-react';

export default function DashboardPage({ telemetry, history, settings, dataSourceMode, setDataSourceMode, refreshThingSpeak }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px 40px' }}>
      
      {/* Stream Controls Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {dataSourceMode === 'THINGSPEAK' ? (
            <Cloud size={20} style={{ color: 'var(--primary-color)' }} />
          ) : (
            <Radio size={20} style={{ color: '#10b981' }} />
          )}
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Source: <span style={{ color: 'var(--primary-color)' }}>{dataSourceMode === 'THINGSPEAK' ? 'ThingSpeak Cloud (Channel 3519643)' : 'Local / Simulation'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
            <Clock size={14} /> Updated: {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : 'N/A'}
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
                padding: '6px 12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'var(--primary-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <RefreshCw size={12} /> Sync Cloud
            </button>
          )}

          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.6)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setDataSourceMode && setDataSourceMode('LOCAL')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: dataSourceMode === 'LOCAL' ? 'var(--primary-color)' : 'transparent',
                color: dataSourceMode === 'LOCAL' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              LOCAL
            </button>

            <button
              onClick={() => setDataSourceMode && setDataSourceMode('THINGSPEAK')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: dataSourceMode === 'THINGSPEAK' ? 'var(--primary-color)' : 'transparent',
                color: dataSourceMode === 'THINGSPEAK' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              THINGSPEAK
            </button>
          </div>
        </div>
      </div>

      {/* Top Row: Distance Gauge & Actuators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <DistanceGauge
          distanceCm={telemetry.distanceCm}
          riskLevel={telemetry.riskLevel}
          sensorStatus={telemetry.sensorStatus}
        />

        <ActuatorStatus
          actuators={telemetry.actuators}
          riskLevel={telemetry.riskLevel}
          distanceCm={telemetry.distanceCm}
          sensorStatus={telemetry.sensorStatus}
        />
      </div>

      {/* Middle Row: Live Waveform Chart & Device Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <LiveGraph history={history} settings={settings} />
        <DeviceCard telemetry={telemetry} />
      </div>

      {/* Analytics Summary */}
      <AnalyticsCards />

      {/* Recent Incident Log Table */}
      <EventTable />

    </div>
  );
}
