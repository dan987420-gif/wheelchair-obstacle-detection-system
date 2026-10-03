import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertOctagon, AlertTriangle, ShieldCheck, Activity, Timer, Zap } from 'lucide-react';

export default function AnalyticsCards() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalEvents: 0,
    warningEvents: 0,
    cautionEvents: 0,
    avgMinDistanceCm: 0,
    avgDurationSeconds: 0,
    totalReadingsRecorded: 0,
    riskDistribution: { SAFE: 0, CAUTION: 0, WARNING: 0, CRITICAL: 0 }
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getStatisticsOverview();
        if (res.success) {
          setStats(res.data);
        }
      } catch (e) {
        console.error('[Analytics] Error loading stats:', e);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalDistCount = Object.values(stats.riskDistribution || {}).reduce((a, b) => a + b, 0) || 1;
  const safePct = Math.round(((stats.riskDistribution?.SAFE || 0) / totalDistCount) * 100);
  const cautionPct = Math.round(((stats.riskDistribution?.CAUTION || 0) / totalDistCount) * 100);
  const warningPct = Math.round(((stats.riskDistribution?.WARNING || 0) / totalDistCount) * 100);
  const criticalPct = Math.round(((stats.riskDistribution?.CRITICAL || 0) / totalDistCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Total Obstacle Encounters */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              OBSTACLE INCIDENTS
            </span>
            <Activity size={18} color="#06b6d4" />
          </div>
          <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats.totalEvents}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Grouped proximity encounters
          </div>
        </div>

        {/* Critical Alerts Count */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              CRITICAL HAZARDS
            </span>
            <AlertOctagon size={18} color="#ef4444" />
          </div>
          <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>
            {stats.criticalEvents}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Severe proximity breaches (&le; 50 cm)
          </div>
        </div>

        {/* Avg Minimum Distance */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              AVG CLOSEST PROXIMITY
            </span>
            <Zap size={18} color="#eab308" />
          </div>
          <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats.avgMinDistanceCm} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Mean closest obstacle approach
          </div>
        </div>

        {/* Avg Incident Clearance Duration */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              AVG CLEARANCE TIME
            </span>
            <Timer size={18} color="#10b981" />
          </div>
          <div className="font-heading" style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
            {stats.avgDurationSeconds} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>s</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Time until obstacle path cleared
          </div>
        </div>

      </div>

      {/* Risk Distribution Breakdown Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>
          Safety State &amp; Risk Distribution
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Proportional exposure across all recorded ultrasonic distance measurements
        </p>

        {/* Multi-segment Progress Bar */}
        <div style={{ display: 'flex', height: '14px', borderRadius: '9999px', overflow: 'hidden', background: '#1e293b', marginBottom: '16px' }}>
          <div style={{ width: `${safePct}%`, background: '#10b981', transition: 'width 0.3s' }} title={`Safe: ${safePct}%`} />
          <div style={{ width: `${cautionPct}%`, background: '#eab308', transition: 'width 0.3s' }} title={`Caution: ${cautionPct}%`} />
          <div style={{ width: `${warningPct}%`, background: '#f97316', transition: 'width 0.3s' }} title={`Warning: ${warningPct}%`} />
          <div style={{ width: `${criticalPct}%`, background: '#ef4444', transition: 'width 0.3s' }} title={`Critical: ${criticalPct}%`} />
        </div>

        {/* Legend */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ color: 'var(--text-secondary)' }}>SAFE:</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>{safePct}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
            <span style={{ color: 'var(--text-secondary)' }}>CAUTION:</span>
            <span style={{ fontWeight: 700, color: '#eab308' }}>{cautionPct}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }} />
            <span style={{ color: 'var(--text-secondary)' }}>WARNING:</span>
            <span style={{ fontWeight: 700, color: '#f97316' }}>{warningPct}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ color: 'var(--text-secondary)' }}>CRITICAL:</span>
            <span style={{ fontWeight: 700, color: '#ef4444' }}>{criticalPct}%</span>
          </div>
        </div>
      </div>

    </div>
  );
}
