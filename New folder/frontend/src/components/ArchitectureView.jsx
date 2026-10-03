import React from 'react';
import { Cpu, ShieldCheck, Wifi, Server, Database, Monitor, AlertTriangle, Layers } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Safety & Academic Disclaimer Banner */}
      <div className="glass-panel" style={{ padding: '20px', borderLeft: '6px solid #eab308' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#eab308', fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>
          <AlertTriangle size={20} />
          <span>IMPORTANT SAFETY &amp; ACADEMIC DISCLAIMER</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          This system is a college-level educational engineering prototype and hardware-in-the-loop simulation. It provides 
          proximity-based obstacle detection assistance to support situational awareness. It is <strong>not a certified medical device</strong>, 
          is not a replacement for certified mobility equipment or personal visual scanning, and does not claim 100% collision prevention under 
          all environmental acoustic scenarios (e.g. sharp angles, sound-absorbent soft fabrics, or objects outside the HC-SR04 cone of sight).
        </p>
      </div>

      {/* End-to-End System Pipeline Block Diagram */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={20} color="#06b6d4" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
            End-to-End System Architecture
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', textAlign: 'center' }}>
          
          {/* Layer 1 */}
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#06b6d4', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#ffffff" />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: '#06b6d4' }}>1. HC-SR04 Sensor</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Emits 40kHz ultrasonic bursts. Measures echo pulse width (µs) to calculate front distance.
            </p>
          </div>

          {/* Layer 2 */}
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} color="#ffffff" />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: '#3b82f6' }}>2. ESP32 Controller</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Median filter, risk engine, autonomous LED/buzzer/vibration alerts &amp; local SSD1306 OLED HUD.
            </p>
          </div>

          {/* Layer 3 */}
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8b5cf6', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wifi size={20} color="#ffffff" />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: '#8b5cf6' }}>3. IoT Transport</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              JSON Lines over Serial and HTTP POST telemetry payloads to backend ingestion gateway.
            </p>
          </div>

          {/* Layer 4 */}
          <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eab308', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} color="#000000" />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: '#eab308' }}>4. Backend &amp; DB</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Express.js REST API, SQLite database storage, and event grouping engine.
            </p>
          </div>

          {/* Layer 5 */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={20} color="#ffffff" />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px', color: '#10b981' }}>5. Live Dashboard</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              React + WebSockets instant telemetry HUD, waveform graphs, and configurable thresholds.
            </p>
          </div>

        </div>
      </div>

      {/* Hardware Pin Mapping Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
          ESP32 DevKit Pin Assignments (Wokwi &amp; Physical Hardware)
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Component</th>
                <th style={{ padding: '10px' }}>ESP32 GPIO</th>
                <th style={{ padding: '10px' }}>Pin Mode</th>
                <th style={{ padding: '10px' }}>Description &amp; Alert Role</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>HC-SR04 TRIG</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#06b6d4' }}>GPIO 5</td>
                <td style={{ padding: '10px' }}>OUTPUT</td>
                <td style={{ padding: '10px' }}>Sends 10µs ultrasonic burst trigger pulse</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>HC-SR04 ECHO</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#06b6d4' }}>GPIO 18</td>
                <td style={{ padding: '10px' }}>INPUT</td>
                <td style={{ padding: '10px' }}>Measures return pulse duration with safety timeout</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>Green LED</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#10b981' }}>GPIO 25</td>
                <td style={{ padding: '10px' }}>OUTPUT</td>
                <td style={{ padding: '10px' }}>Indicates SAFE distance (&gt; 150 cm)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>Yellow LED</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#eab308' }}>GPIO 26</td>
                <td style={{ padding: '10px' }}>OUTPUT</td>
                <td style={{ padding: '10px' }}>Indicates CAUTION (Solid) / WARNING (Flashing)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>Red LED</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#ef4444' }}>GPIO 27</td>
                <td style={{ padding: '10px' }}>OUTPUT</td>
                <td style={{ padding: '10px' }}>Emergency indicator for CRITICAL hazards (&le; 50 cm)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>Piezo Buzzer</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#f97316' }}>GPIO 14</td>
                <td style={{ padding: '10px' }}>OUTPUT</td>
                <td style={{ padding: '10px' }}>Acoustic alert tones (Slow / Medium / Rapid Siren)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '10px', fontWeight: 700 }}>Vibration Motor</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>GPIO 12</td>
                <td style={{ padding: '10px' }}>OUTPUT</td>
                <td style={{ padding: '10px' }}>Tactile / haptic vibration pulses for user feedback</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', fontWeight: 700 }}>OLED I2C</td>
                <td style={{ padding: '10px', fontFamily: 'JetBrains Mono', color: '#a855f7' }}>GPIO 21 (SDA), 22 (SCL)</td>
                <td style={{ padding: '10px' }}>I2C Bus</td>
                <td style={{ padding: '10px' }}>Local 128x64 SSD1306 distance &amp; risk display</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
