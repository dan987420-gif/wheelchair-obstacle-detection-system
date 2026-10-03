import React from 'react';
import ThresholdSettings from '../components/ThresholdSettings';

export default function SettingsPage({ settings, onSettingsUpdated }) {
  return (
    <div style={{ padding: '0 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <ThresholdSettings settings={settings} onSettingsUpdated={onSettingsUpdated} />
    </div>
  );
}
