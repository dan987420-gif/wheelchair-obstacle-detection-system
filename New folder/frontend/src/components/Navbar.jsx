import React from 'react';
import { 
  Radio, 
  Activity, 
  Sliders, 
  History, 
  BarChart3, 
  Cpu, 
  Info, 
  Volume2, 
  VolumeX, 
  ShieldAlert,
  PlaySquare
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, connectionStatus, audioEnabled, toggleAudio, source }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'live', label: 'Live Monitor', icon: Radio },
    { id: 'simulation', label: 'Simulation Mode', icon: PlaySquare },
    { id: 'events', label: 'Obstacle Events', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'device', label: 'Device & Hardware', icon: Cpu },
    { id: 'settings', label: 'Safety Thresholds', icon: Sliders },
    { id: 'about', label: 'Architecture & Docs', icon: Info },
  ];

  return (
    <header className="glass-panel" style={{ margin: '16px 20px', padding: '14px 24px', position: 'sticky', top: '16px', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Title & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldAlert size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Wheelchair Obstacle Detection System
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Real-Time Ultrasonic Assistive Safety HUD &bull; Prototype v1.0
            </p>
          </div>
        </div>

        {/* Global Controls & Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Connection Badge */}
          <div className="badge font-mono" style={{
            background: connectionStatus === 'CONNECTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            borderColor: connectionStatus === 'CONNECTED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            color: connectionStatus === 'CONNECTED' ? '#34d399' : '#f87171'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connectionStatus === 'CONNECTED' ? '#10b981' : '#ef4444',
              boxShadow: connectionStatus === 'CONNECTED' ? '0 0 10px #10b981' : '0 0 10px #ef4444'
            }} />
            {connectionStatus === 'CONNECTED' ? 'WS LIVE' : 'OFFLINE'}
          </div>

          {/* Source Tag */}
          <div className="badge font-mono" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            SRC: {source || 'WOKWI'}
          </div>

          {/* Audio Synthesizer Alarm Toggle */}
          <button
            onClick={toggleAudio}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            title={audioEnabled ? "Mute Web Audio Alarm" : "Enable Web Audio Alert Beeps"}
          >
            {audioEnabled ? (
              <>
                <Volume2 size={16} color="#10b981" />
                <span>Audio ON</span>
              </>
            ) : (
              <>
                <VolumeX size={16} color="#94a3b8" />
                <span>Audio Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? 'rgba(6, 182, 212, 0.5)' : 'transparent',
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#06b6d4' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
