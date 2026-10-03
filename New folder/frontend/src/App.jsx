import React, { useState } from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import SimulationPage from './pages/SimulationPage';
import EventsPage from './pages/EventsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DevicePage from './pages/DevicePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { AlertOctagon, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    telemetry,
    history,
    connectionStatus,
    activeAlert,
    dismissAlert,
    audioEnabled,
    toggleAudio,
    settings,
    reloadSettings
  } = useTelemetry();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Critical Hazard Alert Banner */}
      {activeAlert && (
        <div
          className="alert-pulse-critical"
          style={{
            margin: '16px 20px 0',
            padding: '14px 20px',
            background: 'rgba(239, 68, 68, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.5)',
            zIndex: 1000
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon size={24} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                IMMEDIATE STOP ADVISED: CRITICAL PROXIMITY ({activeAlert.distanceCm} cm)
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                {activeAlert.message}
              </div>
            </div>
          </div>
          <button
            onClick={dismissAlert}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        audioEnabled={audioEnabled}
        toggleAudio={toggleAudio}
        source={telemetry.source}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardPage
            telemetry={telemetry}
            history={history}
            settings={settings}
          />
        )}
        {activeTab === 'live' && (
          <LiveMonitorPage
            telemetry={telemetry}
            history={history}
            settings={settings}
          />
        )}
        {activeTab === 'simulation' && (
          <SimulationPage
            telemetry={telemetry}
            history={history}
            settings={settings}
          />
        )}
        {activeTab === 'events' && <EventsPage />}
        {activeTab === 'analytics' && (
          <AnalyticsPage
            history={history}
            settings={settings}
          />
        )}
        {activeTab === 'device' && <DevicePage telemetry={telemetry} />}
        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onSettingsUpdated={reloadSettings}
          />
        )}
        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        background: 'rgba(10, 14, 23, 0.9)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong>Wheelchair Obstacle Detection System</strong> &bull; College Engineering Project Prototype
          </div>
          <div>
            Hardware: ESP32 + HC-SR04 &bull; Simulation: Wokwi &bull; Architecture: Full-Stack IoT
          </div>
        </div>
      </footer>

    </div>
  );
}
