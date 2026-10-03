import React, { useState } from 'react';
import { api } from '../services/api';
import { Sliders, Play, Square, FastForward, ShieldAlert, Sparkles } from 'lucide-react';

export default function SimulationPanel({ onReadingSent }) {
  const [distance, setDistance] = useState(120);
  const [autoRunning, setAutoRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSliderChange = async (e) => {
    const val = parseFloat(e.target.value);
    setDistance(val);
    try {
      await api.sendSimulationReading(val);
      if (onReadingSent) onReadingSent(val);
    } catch (err) {
      console.error('[Simulation Error]', err);
    }
  };

  const handlePreset = async (presetDist, label) => {
    setDistance(presetDist);
    setStatusMsg(`Simulating ${label} (${presetDist} cm)...`);
    try {
      await api.sendSimulationReading(presetDist);
      if (onReadingSent) onReadingSent(presetDist);
    } catch (err) {
      console.error('[Simulation Error]', err);
    }
  };

  const toggleAutoSimulation = async () => {
    setLoading(true);
    try {
      if (autoRunning) {
        await api.stopAutoSimulation();
        setAutoRunning(false);
        setStatusMsg('Auto scenario simulation stopped.');
      } else {
        await api.startAutoSimulation();
        setAutoRunning(true);
        setStatusMsg('Auto scenario sequence started: Approaching & Retreating obstacle.');
      }
    } catch (err) {
      console.error('[Simulation Error]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Software Simulation & Evaluation Rig
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Test risk classification, actuator triggers, and telemetry without physical or Wokwi hardware
          </p>
        </div>

        <span className="badge font-mono" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          SOURCE: SOFTWARE_SIMULATION
        </span>
      </div>

      {/* Interactive Slider */}
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Simulated Distance Slider:
          </label>
          <span className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#06b6d4' }}>
            {distance} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>cm</span>
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="300"
          step="1"
          value={distance}
          onChange={handleSliderChange}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            accentColor: '#06b6d4',
            cursor: 'pointer'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>10 cm (Critical)</span>
          <span>50 cm (Warning)</span>
          <span>100 cm (Caution)</span>
          <span>150 cm (Safe)</span>
          <span>300 cm (Max)</span>
        </div>
      </div>

      {/* Quick Viva & Demonstration Presets */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Demonstration Presets (Viva Ready)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => handlePreset(200, 'SAFE')}
            className="btn btn-secondary"
            style={{ borderLeft: '4px solid #10b981', justifyContent: 'space-between' }}
          >
            <span>Safe Test</span>
            <span style={{ fontWeight: 700, color: '#10b981' }}>200 cm</span>
          </button>

          <button
            onClick={() => handlePreset(125, 'CAUTION')}
            className="btn btn-secondary"
            style={{ borderLeft: '4px solid #eab308', justifyContent: 'space-between' }}
          >
            <span>Caution Test</span>
            <span style={{ fontWeight: 700, color: '#eab308' }}>125 cm</span>
          </button>

          <button
            onClick={() => handlePreset(75, 'WARNING')}
            className="btn btn-secondary"
            style={{ borderLeft: '4px solid #f97316', justifyContent: 'space-between' }}
          >
            <span>Warning Test</span>
            <span style={{ fontWeight: 700, color: '#f97316' }}>75 cm</span>
          </button>

          <button
            onClick={() => handlePreset(30, 'CRITICAL')}
            className="btn btn-secondary"
            style={{ borderLeft: '4px solid #ef4444', justifyContent: 'space-between' }}
          >
            <span>Critical Test</span>
            <span style={{ fontWeight: 700, color: '#ef4444' }}>30 cm</span>
          </button>
        </div>
      </div>

      {/* Automatic Dynamic Scenario */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', padding: '16px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#06b6d4' }}>
            Automated Obstacle Approach Scenario
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Automatically oscillates distance from 220cm down to 25cm to demonstrate full lifecycle
          </div>
        </div>

        <button
          onClick={toggleAutoSimulation}
          className={`btn ${autoRunning ? 'btn-danger' : 'btn-primary'}`}
          disabled={loading}
          style={{ minWidth: '150px' }}
        >
          {autoRunning ? (
            <>
              <Square size={16} />
              <span>Stop Scenario</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Run Auto Demo</span>
            </>
          )}
        </button>
      </div>

      {statusMsg && (
        <div style={{ marginTop: '14px', fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
          &bull; {statusMsg}
        </div>
      )}
    </div>
  );
}
