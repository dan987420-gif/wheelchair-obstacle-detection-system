import React from 'react';
import DistanceGauge from '../components/DistanceGauge';
import ActuatorStatus from '../components/ActuatorStatus';
import LiveGraph from '../components/LiveGraph';

export default function LiveMonitorPage({ telemetry, history, settings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      
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
