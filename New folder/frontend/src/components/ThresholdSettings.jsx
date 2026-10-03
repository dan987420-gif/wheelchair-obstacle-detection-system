import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sliders, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ThresholdSettings({ settings, onSettingsUpdated }) {
  const [form, setForm] = useState({
    safeDistanceCm: 150,
    cautionDistanceCm: 100,
    warningDistanceCm: 50,
    criticalDistanceCm: 30,
    hysteresisCm: 4
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        safeDistanceCm: settings.safeDistanceCm || 150,
        cautionDistanceCm: settings.cautionDistanceCm || 100,
        warningDistanceCm: settings.warningDistanceCm || 50,
        criticalDistanceCm: settings.criticalDistanceCm || 30,
        hysteresisCm: settings.hysteresisCm || 4
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation: safe > caution > warning >= critical > 0
    if (form.criticalDistanceCm <= 0) {
      setError('Critical distance must be greater than 0 cm.');
      return;
    }
    if (form.criticalDistanceCm > form.warningDistanceCm) {
      setError('Critical threshold must be less than or equal to Warning threshold.');
      return;
    }
    if (form.warningDistanceCm >= form.cautionDistanceCm) {
      setError('Warning threshold must be strictly less than Caution threshold.');
      return;
    }
    if (form.cautionDistanceCm >= form.safeDistanceCm) {
      setError('Caution threshold must be strictly less than Safe threshold.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateSettings(form);
      if (res.success) {
        setSuccess('Safety thresholds updated and propagated to backend engine.');
        if (onSettingsUpdated) onSettingsUpdated(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update safety settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setForm({
      safeDistanceCm: 150,
      cautionDistanceCm: 100,
      warningDistanceCm: 50,
      criticalDistanceCm: 30,
      hysteresisCm: 4
    });
    setError('');
    setSuccess('Defaults restored in form. Click "Save Thresholds" to commit.');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Safety Distance Thresholds & Hysteresis
            </h3>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Centralized risk boundary parameters (Safe &gt; Caution &gt; Warning &ge; Critical &gt; 0)
          </p>
        </div>

        <span className="badge font-mono" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          CONFIG CONTRACT v1.0
        </span>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '16px' }}>
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          {/* Safe Distance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '6px' }}>
              SAFE DISTANCE THRESHOLD
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="100"
                max="350"
                value={form.safeDistanceCm}
                onChange={(e) => handleChange('safeDistanceCm', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#111827', border: '1px solid #1e293b', color: '#f8fafc', fontWeight: 700 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>cm</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Distances &gt; this value trigger SAFE status (Green LED).
            </p>
          </div>

          {/* Caution Distance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#eab308', marginBottom: '6px' }}>
              CAUTION DISTANCE THRESHOLD
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="60"
                max="200"
                value={form.cautionDistanceCm}
                onChange={(e) => handleChange('cautionDistanceCm', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#111827', border: '1px solid #1e293b', color: '#f8fafc', fontWeight: 700 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>cm</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Between Caution and Safe threshold triggers Yellow LED &amp; slow chirp.
            </p>
          </div>

          {/* Warning Distance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f97316', marginBottom: '6px' }}>
              WARNING DISTANCE THRESHOLD
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="30"
                max="120"
                value={form.warningDistanceCm}
                onChange={(e) => handleChange('warningDistanceCm', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#111827', border: '1px solid #1e293b', color: '#f8fafc', fontWeight: 700 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>cm</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Between Warning and Caution triggers flashing Yellow LED &amp; medium buzz.
            </p>
          </div>

          {/* Critical Distance */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
              CRITICAL HAZARD THRESHOLD
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="10"
                max="80"
                value={form.criticalDistanceCm}
                onChange={(e) => handleChange('criticalDistanceCm', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#111827', border: '1px solid #1e293b', color: '#f8fafc', fontWeight: 700 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>cm</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Distances &le; this value trigger emergency Red LED, rapid siren &amp; haptic pulses.
            </p>
          </div>

          {/* Hysteresis */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4', marginBottom: '6px' }}>
              HYSTERESIS MARGIN
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max="15"
                value={form.hysteresisCm}
                onChange={(e) => handleChange('hysteresisCm', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#111827', border: '1px solid #1e293b', color: '#f8fafc', fontWeight: 700 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>cm</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Prevents chatter when fluctuating around boundary edges.
            </p>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary"
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save & Propagate Thresholds'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
