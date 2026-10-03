import React from 'react';
import DeviceCard from '../components/DeviceCard';
import ActuatorStatus from '../components/ActuatorStatus';

export default function DevicePage({ telemetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <DeviceCard telemetry={telemetry} />
      <ActuatorStatus
        actuators={telemetry.actuators}
        riskLevel={telemetry.riskLevel}
        distanceCm={telemetry.distanceCm}
        sensorStatus={telemetry.sensorStatus}
      />
    </div>
  );
}
