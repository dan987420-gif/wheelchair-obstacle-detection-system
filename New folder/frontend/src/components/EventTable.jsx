import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Download, Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function EventTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (riskFilter) params.riskLevel = riskFilter;
      if (sourceFilter) params.source = sourceFilter;
      const res = await api.getObstacleEvents(params);
      if (res.success) {
        setEvents(res.data);
      }
    } catch (e) {
      console.error('[Events] Error loading events:', e);
    } finally {
      setLoading(false);
    }
  }, [search, riskFilter, sourceFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'SAFE': return 'badge-safe';
      case 'CAUTION': return 'badge-caution';
      case 'WARNING': return 'badge-warning';
      case 'CRITICAL': return 'badge-critical';
      default: return 'badge-offline';
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
            Obstacle Incident Log & History
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Grouped obstacle detection encounters, minimum proximity, and clearance duration
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={fetchEvents} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          <a
            href={api.exportEventsCsvUrl()}
            download="wheelchair_obstacle_events.csv"
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by device or risk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Risk Filter */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: '#111827',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Risk Levels</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARNING">WARNING</option>
          <option value="CAUTION">CAUTION</option>
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            background: '#111827',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.85rem'
          }}
        >
          <option value="">All Sources</option>
          <option value="WOKWI">WOKWI Simulation</option>
          <option value="SOFTWARE_SIMULATION">Software Simulation</option>
          <option value="REAL_HARDWARE">Real Hardware</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px 10px' }}>ID</th>
              <th style={{ padding: '12px 10px' }}>Start Time</th>
              <th style={{ padding: '12px 10px' }}>Risk Level</th>
              <th style={{ padding: '12px 10px' }}>Min Distance</th>
              <th style={{ padding: '12px 10px' }}>Duration</th>
              <th style={{ padding: '12px 10px' }}>Device</th>
              <th style={{ padding: '12px 10px' }}>Source</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <div>No obstacle events matching criteria.</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Obstacle events are automatically recorded when sensor detects proximity &lt; 150 cm.
                  </div>
                </td>
              </tr>
            ) : (
              events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                    #{ev.id}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {new Date(ev.start_time).toLocaleTimeString()}
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(ev.start_time).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge ${getRiskBadgeClass(ev.risk_level)}`}>
                      {ev.risk_level}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', fontWeight: 700, color: ev.minimum_distance_cm <= 50 ? '#ef4444' : '#f8fafc' }}>
                    {ev.minimum_distance_cm} cm
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {ev.duration_seconds ? `${ev.duration_seconds}s` : (ev.is_active ? '< 1s' : '1s')}
                  </td>
                  <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono' }}>
                    {ev.device_id}
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                      {ev.source}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    {ev.is_active ? (
                      <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="badge badge-safe" style={{ fontSize: '0.65rem' }}>
                        CLEARED
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
