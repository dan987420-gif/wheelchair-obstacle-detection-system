import React from 'react';
import { Lightbulb, BellRing, Waves, Monitor } from 'lucide-react';

export default function ActuatorStatus({ actuators, riskLevel, distanceCm, sensorStatus }) {
  const { buzzer, vibration, led } = actuators || {};

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          Hardware Actuators & Multi-Modal Alerts
        </h3>
        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
          ESP32 LOCAL CONTROL
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        
        {/* GREEN LED */}
        <div style={{
          background: led === 'GREEN' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${led === 'GREEN' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            margin: '0 auto 8px',
            backgroundColor: led === 'GREEN' ? '#10b981' : '#1e293b',
            boxShadow: led === 'GREEN' ? '0 0 15px #10b981' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lightbulb size={16} color={led === 'GREEN' ? '#ffffff' : '#64748b'} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: led === 'GREEN' ? '#10b981' : 'var(--text-muted)' }}>
            GREEN LED
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {led === 'GREEN' ? 'ACTIVE (SAFE)' : 'OFF'}
          </div>
        </div>

        {/* YELLOW LED */}
        <div style={{
          background: (led === 'YELLOW' || led === 'YELLOW_BLINKING') ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${(led === 'YELLOW' || led === 'YELLOW_BLINKING') ? 'rgba(234, 179, 8, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            margin: '0 auto 8px',
            backgroundColor: (led === 'YELLOW' || led === 'YELLOW_BLINKING') ? '#eab308' : '#1e293b',
            boxShadow: (led === 'YELLOW' || led === 'YELLOW_BLINKING') ? '0 0 15px #eab308' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lightbulb size={16} color={(led === 'YELLOW' || led === 'YELLOW_BLINKING') ? '#ffffff' : '#64748b'} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: (led === 'YELLOW' || led === 'YELLOW_BLINKING') ? '#eab308' : 'var(--text-muted)' }}>
            YELLOW LED
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {led === 'YELLOW_BLINKING' ? 'FLASHING' : (led === 'YELLOW' ? 'ON (CAUTION)' : 'OFF')}
          </div>
        </div>

        {/* RED LED */}
        <div style={{
          background: led === 'RED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${led === 'RED' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            margin: '0 auto 8px',
            backgroundColor: led === 'RED' ? '#ef4444' : '#1e293b',
            boxShadow: led === 'RED' ? '0 0 20px #ef4444' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Lightbulb size={16} color={led === 'RED' ? '#ffffff' : '#64748b'} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: led === 'RED' ? '#ef4444' : 'var(--text-muted)' }}>
            RED LED
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {led === 'RED' ? 'ALARM (CRITICAL)' : 'OFF'}
          </div>
        </div>

        {/* ACOUSTIC BUZZER */}
        <div style={{
          background: buzzer ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${buzzer ? 'rgba(249, 115, 22, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            margin: '0 auto 8px',
            backgroundColor: buzzer ? '#f97316' : '#1e293b',
            boxShadow: buzzer ? '0 0 15px #f97316' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BellRing size={16} color={buzzer ? '#ffffff' : '#64748b'} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: buzzer ? '#f97316' : 'var(--text-muted)' }}>
            PIEZO BUZZER
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {buzzer ? (riskLevel === 'CRITICAL' ? 'RAPID 100MS SIREN' : 'PULSED BEEP') : 'SILENT'}
          </div>
        </div>

        {/* HAPTIC VIBRATION MOTOR */}
        <div style={{
          background: vibration ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${vibration ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          transition: 'all 0.2s ease'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            margin: '0 auto 8px',
            backgroundColor: vibration ? '#06b6d4' : '#1e293b',
            boxShadow: vibration ? '0 0 15px #06b6d4' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Waves size={16} color={vibration ? '#ffffff' : '#64748b'} />
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: vibration ? '#06b6d4' : 'var(--text-muted)' }}>
            VIBRATION MOTOR
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {vibration ? (riskLevel === 'CRITICAL' ? 'RAPID HAPTIC PULSE' : 'TACTILE ALERT') : 'INACTIVE'}
          </div>
        </div>

      </div>

      {/* OLED Visualizer Strip */}
      <div style={{
        marginTop: '16px',
        padding: '10px 14px',
        background: '#05070a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4' }}>
          <Monitor size={14} />
          <span>OLED 128x64 DISPLAY HUD:</span>
        </div>
        <div style={{ color: '#f8fafc' }}>
          DIST: <span style={{ color: '#06b6d4' }}>{distanceCm >= 0 ? `${distanceCm.toFixed(1)} cm` : '---'}</span> | 
          RISK: <span style={{ color: riskLevel === 'CRITICAL' ? '#ef4444' : '#10b981' }}>{riskLevel}</span> | 
          STATUS: <span style={{ color: '#38bdf8' }}>{sensorStatus || 'OK'}</span>
        </div>
      </div>
    </div>
  );
}
