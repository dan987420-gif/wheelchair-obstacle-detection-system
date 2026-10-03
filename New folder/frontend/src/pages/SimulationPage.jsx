import React from 'react';
import SimulationPanel from '../components/SimulationPanel';
import DistanceGauge from '../components/DistanceGauge';
import ActuatorStatus from '../components/ActuatorStatus';
import LiveGraph from '../components/LiveGraph';

export default function SimulationPage({ telemetry, history, settings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <SimulationPanel />

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

      <LiveGraph history={history} settings={settings} />
    </div>
  );
}
