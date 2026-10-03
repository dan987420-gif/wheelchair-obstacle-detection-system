import React from 'react';
import AnalyticsCards from '../components/AnalyticsCards';
import LiveGraph from '../components/LiveGraph';

export default function AnalyticsPage({ history, settings }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <AnalyticsCards />
      <LiveGraph history={history} settings={settings} />
    </div>
  );
}
