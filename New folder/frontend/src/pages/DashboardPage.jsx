import React from 'react';
import DistanceGauge from '../components/DistanceGauge';
import LiveGraph from '../components/LiveGraph';
import ActuatorStatus from '../components/ActuatorStatus';
import EventTable from '../components/EventTable';
import AnalyticsCards from '../components/AnalyticsCards';
import DeviceCard from '../components/DeviceCard';

export default function DashboardPage({ telemetry, history, settings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px 40px' }}>
      
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
