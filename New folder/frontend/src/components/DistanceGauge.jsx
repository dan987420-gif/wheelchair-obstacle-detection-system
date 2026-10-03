import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function DistanceGauge({ distanceCm, riskLevel, sensorStatus, size = 'normal' }) {
  const isLarge = size === 'large';
  const validDist = distanceCm >= 0 ? distanceCm : null;

  const getRiskConfig = (risk) => {
    switch (risk) {
      case 'SAFE':
        return {
          label: 'SAFE',
          icon: ShieldCheck,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          message: 'Path clear. Obstacle distance is safe (> 150 cm).'
        };
      case 'CAUTION':
        return {
          label: 'CAUTION',
          icon: AlertTriangle,
          color: '#eab308',
          bg: 'rgba(234, 179, 8, 0.12)',
          border: 'rgba(234, 179, 8, 0.3)',
          message: 'Obstacle approaching (100 - 150 cm). Maintain awareness.'
        };
      case 'WARNING':
        return {
          label: 'WARNING',
          icon: AlertCircle,
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.15)',
          border: 'rgba(249, 115, 22, 0.4)',
          message: 'Obstacle in proximity (50 - 100 cm). Prepare to steer or halt.'
        };
      case 'CRITICAL':
        return {
          label: 'CRITICAL HAZARD',
          icon: AlertOctagon,
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.2)',
          border: 'rgba(239, 68, 68, 0.6)',
          message: 'CRITICAL PROXIMITY (< 50 cm)! Immediate stop advised.'
        };
      default:
        return {
          label: 'SENSOR OFFLINE / UNKNOWN',
          icon: HelpCircle,
          color: '#94a3b8',
          bg: 'rgba(100, 116, 139, 0.15)',
          border: 'rgba(100, 116, 139, 0.3)',
          message: 'Sensor reading unavailable. Verify HC-SR04 connection.'
        };
    }
  };

  const riskConfig = getRiskConfig(riskLevel);
  const RiskIcon = riskConfig.icon;

  // Compute progress percentage (0cm = 0%, 250cm+ = 100%)
  const percentage = validDist !== null ? Math.min(100, Math.max(0, (validDist / 250) * 100)) : 0;

  return (
    <div
      className={`glass-panel ${riskLevel === 'CRITICAL' ? 'alert-pulse-critical' : (riskLevel === 'WARNING' ? 'alert-pulse-warning' : '')}`}
      style={{
        padding: isLarge ? '40px' : '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Proximity Arc / Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${riskConfig.color}22 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Real-Time Proximity Sensor (HC-SR04)
        </span>
        <span
          className="badge"
          style={{
            background: riskConfig.bg,
            borderColor: riskConfig.border,
            color: riskConfig.color
          }}
        >
          <RiskIcon size={14} />
          {riskConfig.label}
        </span>
      </div>

      {/* Main Distance Readout */}
      <div style={{ margin: isLarge ? '32px 0' : '20px 0' }}>
        <div
          className="font-heading"
          style={{
            fontSize: isLarge ? '5.5rem' : '3.75rem',
            fontWeight: 900,
            lineHeight: 1,
            color: riskConfig.color,
            textShadow: `0 0 30px ${riskConfig.color}66`
          }}
        >
          {validDist !== null ? validDist.toFixed(1) : '---'}
          <span style={{ fontSize: isLarge ? '2rem' : '1.5rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '8px' }}>
            cm
          </span>
        </div>

        <p style={{ marginTop: '12px', fontSize: isLarge ? '1.1rem' : '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {riskConfig.message}
        </p>
      </div>

      {/* Proximity Gauge Bar */}
      <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', height: '10px', overflow: 'hidden', margin: '20px 0 10px' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: `linear-gradient(to right, #ef4444 0%, #f97316 35%, #eab308 65%, #10b981 100%)`,
            transition: 'width 0.25s ease-out'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        <span>0 cm (Hazard)</span>
        <span>50 cm</span>
        <span>100 cm</span>
        <span>150 cm</span>
        <span>250+ cm (Safe)</span>
      </div>
    </div>
  );
}
