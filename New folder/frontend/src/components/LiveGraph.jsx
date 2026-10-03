import React, { useRef, useEffect } from 'react';

export default function LiveGraph({ history = [], settings }) {
  const canvasRef = useRef(null);

  const safeThresh = settings?.safeDistanceCm || 150;
  const cautionThresh = settings?.cautionDistanceCm || 100;
  const warningThresh = settings?.warningDistanceCm || 50;
  const criticalThresh = settings?.criticalDistanceCm || 30;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth || 600;
    const height = canvas.height = 220;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Padding
    const padLeft = 45;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const graphWidth = width - padLeft - padRight;
    const graphHeight = height - padTop - padBottom;
    const maxVal = 260;

    // Helper to map distance value (0 to maxVal cm) to Y coordinate
    const getY = (val) => {
      const clamped = Math.max(0, Math.min(maxVal, val));
      return padTop + graphHeight - (clamped / maxVal) * graphHeight;
    };

    // Draw Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let d = 50; d <= 250; d += 50) {
      const y = getY(d);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${d}cm`, padLeft - 6, y + 3);
    }

    // Draw Zone Lines
    const drawThresholdLine = (val, color, label) => {
      const y = getY(val);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = '9px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(label, width - padRight - 55, y - 4);
      ctx.restore();
    };

    drawThresholdLine(safeThresh, 'rgba(16, 185, 129, 0.5)', 'SAFE');
    drawThresholdLine(cautionThresh, 'rgba(234, 179, 8, 0.5)', 'CAUTION');
    drawThresholdLine(warningThresh, 'rgba(249, 115, 22, 0.5)', 'WARNING');
    drawThresholdLine(criticalThresh, 'rgba(239, 68, 68, 0.6)', 'CRITICAL');

    if (history.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting live sensor readings stream...', width / 2, height / 2);
      return;
    }

    // Step X
    const stepX = graphWidth / Math.max(1, history.length - 1);

    // Draw Area Gradient
    const gradient = ctx.createLinearGradient(0, padTop, 0, height - padBottom);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    gradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.1)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.beginPath();
    history.forEach((point, i) => {
      const x = padLeft + i * stepX;
      const y = getY(point.distance >= 0 ? point.distance : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const lastX = padLeft + (history.length - 1) * stepX;
    ctx.lineTo(lastX, height - padBottom);
    ctx.lineTo(padLeft, height - padBottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Line Waveform
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#06b6d4';
    ctx.setLineDash([]);
    history.forEach((point, i) => {
      const x = padLeft + i * stepX;
      const y = getY(point.distance >= 0 ? point.distance : 0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Pulsing Dot on Latest Point
    const latest = history[history.length - 1];
    const currX = padLeft + (history.length - 1) * stepX;
    const currY = getY(latest.distance >= 0 ? latest.distance : 0);

    let pointColor = '#10b981';
    if (latest.risk === 'CAUTION') pointColor = '#eab308';
    if (latest.risk === 'WARNING') pointColor = '#f97316';
    if (latest.risk === 'CRITICAL') pointColor = '#ef4444';

    ctx.fillStyle = pointColor;
    ctx.beginPath();
    ctx.arc(currX, currY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

  }, [history, settings, safeThresh, cautionThresh, warningThresh, criticalThresh]);

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Live Distance Waveform
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Continuous obstacle proximity trajectory over time
          </p>
        </div>
        <span className="badge badge-safe font-mono" style={{ fontSize: '0.7rem' }}>
          {history.length} READINGS
        </span>
      </div>

      <div style={{ width: '100%', height: '220px', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
    </div>
  );
}
