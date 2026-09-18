import React, { useState } from 'react';
import { Activity, Clock, ShieldCheck } from 'lucide-react';

export default function VitalsChart({ checkins = [], selectedVital = 'spO2', onSelectVital = null }) {
  const [vital, setVital] = useState(selectedVital);
  const [timeframe, setTimeframe] = useState('7d'); // '24h', '7d', '30d'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const activeVital = onSelectVital ? selectedVital : vital;
  const setActiveVital = onSelectVital || setVital;

  const vitalConfigs = {
    spO2: {
      name: "Oxygen Saturation (SpO2)",
      unit: "%",
      color: "#0284c7",
      gradientStart: "rgba(2, 132, 199, 0.35)",
      gradientEnd: "rgba(2, 132, 199, 0.02)",
      minY: 85,
      maxY: 100,
      targetMin: 95,
      targetMax: 100,
      normalLabel: "Target: ≥ 95%"
    },
    heartRate: {
      name: "Heart Rate (Pulse)",
      unit: "bpm",
      color: "#ef4444",
      gradientStart: "rgba(239, 68, 68, 0.35)",
      gradientEnd: "rgba(239, 68, 68, 0.02)",
      minY: 45,
      maxY: 130,
      targetMin: 60,
      targetMax: 100,
      normalLabel: "Normal Corridor: 60 - 100 bpm"
    },
    bloodPressureSys: {
      name: "Systolic Blood Pressure",
      unit: "mmHg",
      color: "#8b5cf6",
      gradientStart: "rgba(139, 92, 246, 0.35)",
      gradientEnd: "rgba(139, 92, 246, 0.02)",
      minY: 80,
      maxY: 180,
      targetMin: 95,
      targetMax: 130,
      normalLabel: "Target: 95 - 130 mmHg"
    },
    temperature: {
      name: "Body Temperature",
      unit: "°C",
      color: "#f59e0b",
      gradientStart: "rgba(245, 158, 11, 0.35)",
      gradientEnd: "rgba(245, 158, 11, 0.02)",
      minY: 35.5,
      maxY: 39.5,
      targetMin: 36.4,
      targetMax: 37.5,
      normalLabel: "Normothermic: 36.4 - 37.5 °C"
    },
    respiratoryRate: {
      name: "Respiratory Rate",
      unit: "breaths/min",
      color: "#06b6d4",
      gradientStart: "rgba(6, 182, 212, 0.35)",
      gradientEnd: "rgba(6, 182, 212, 0.02)",
      minY: 10,
      maxY: 30,
      targetMin: 12,
      targetMax: 20,
      normalLabel: "Target: 12 - 20 breaths/min"
    },
    bloodGlucose: {
      name: "Blood Glucose",
      unit: "mg/dL",
      color: "#ec4899",
      gradientStart: "rgba(236, 72, 153, 0.35)",
      gradientEnd: "rgba(236, 72, 153, 0.02)",
      minY: 60,
      maxY: 280,
      targetMin: 80,
      targetMax: 140,
      normalLabel: "Fasting Target: 80 - 140 mg/dL"
    }
  };

  const config = vitalConfigs[activeVital] || vitalConfigs.spO2;

  // Filter checkins based on timeframe
  const now = new Date().getTime();
  const sortedCheckins = [...checkins].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const filtered = sortedCheckins.filter(c => {
    if (!c[activeVital]) return false;
    const diffHours = (now - new Date(c.timestamp).getTime()) / (3600 * 1000);
    if (timeframe === '24h') return diffHours <= 24;
    if (timeframe === '7d') return diffHours <= 24 * 7;
    return diffHours <= 24 * 30;
  });

  // SVG dimensions
  const width = 760;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const points = filtered.map((c, idx) => {
    const val = Number(c[activeVital]);
    const x = padding.left + (filtered.length > 1 ? (idx / (filtered.length - 1)) * plotWidth : plotWidth / 2);
    const clampedVal = Math.max(config.minY, Math.min(config.maxY, val));
    const y = padding.top + plotHeight - ((clampedVal - config.minY) / (config.maxY - config.minY)) * plotHeight;
    return {
      x,
      y,
      val,
      timestamp: c.timestamp,
      mode: c.measurementMode || 'manual',
      notes: c.notes
    };
  });

  // Calculate target green band coordinates
  const targetTopY = padding.top + plotHeight - ((config.targetMax - config.minY) / (config.maxY - config.minY)) * plotHeight;
  const targetBottomY = padding.top + plotHeight - ((config.targetMin - config.minY) / (config.maxY - config.minY)) * plotHeight;
  const targetHeight = Math.max(2, targetBottomY - targetTopY);

  // SVG Path generation
  let pathD = '';
  let areaD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Smooth curve
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;
  }

  return (
    <div className="glass-panel chart-container">
      {/* Chart Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={18} color={config.color} />
            {config.name} Trend
          </h3>
          <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
            <ShieldCheck size={13} color="#10b981" />
            {config.normalLabel}
          </span>
        </div>

        {/* Vital Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {Object.keys(vitalConfigs).map(k => (
            <button
              key={k}
              onClick={() => setActiveVital(k)}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                border: activeVital === k ? `1px solid ${vitalConfigs[k].color}` : '1px solid var(--slate-200)',
                background: activeVital === k ? `${vitalConfigs[k].color}15` : '#ffffff',
                color: activeVital === k ? vitalConfigs[k].color : 'var(--slate-600)',
                cursor: 'pointer'
              }}
            >
              {k === 'spO2' ? 'SpO2' : k === 'heartRate' ? 'Pulse' : k === 'bloodPressureSys' ? 'BP (Sys)' : k === 'temperature' ? 'Temp' : k === 'respiratoryRate' ? 'Resp' : 'Glucose'}
            </button>
          ))}
        </div>

        {/* Timeframe Filter */}
        <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
          {['24h', '7d', '30d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: timeframe === tf ? 700 : 500,
                background: timeframe === tf ? '#ffffff' : 'transparent',
                color: timeframe === tf ? 'var(--primary-700)' : 'var(--slate-600)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: timeframe === tf ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Plot */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id={`grad-${activeVital}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.gradientStart} />
              <stop offset="100%" stopColor={config.gradientEnd} />
            </linearGradient>
          </defs>

          {/* Normal Corridor Green Band */}
          <rect
            x={padding.left}
            y={Math.max(padding.top, targetTopY)}
            width={plotWidth}
            height={targetHeight}
            fill="#10b98118"
            stroke="#10b98130"
            strokeDasharray="3,3"
          />

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding.top + plotHeight * ratio;
            const val = Math.round(config.maxY - ratio * (config.maxY - config.minY));
            return (
              <g key={idx}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render Area fill */}
          {areaD && <path d={areaD} fill={`url(#grad-${activeVital})`} />}

          {/* Render Trend Line */}
          {pathD && <path d={pathD} fill="none" stroke={config.color} strokeWidth="3" strokeLinecap="round" />}

          {/* Render Data Points */}
          {points.map((pt, idx) => (
            <g 
              key={idx} 
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 6 : 4.5}
                fill={pt.mode === 'device' ? '#ffffff' : config.color}
                stroke={config.color}
                strokeWidth={pt.mode === 'device' ? 3 : 2}
              />
            </g>
          ))}

          {/* Axis Labels */}
          {points.length > 0 && (
            <g>
              <text x={points[0].x} y={height - 10} textAnchor="start" fontSize="10" fill="#64748b">
                {new Date(points[0].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </text>
              {points.length > 1 && (
                <text x={points[points.length - 1].x} y={height - 10} textAnchor="end" fontSize="10" fill="#64748b">
                  {new Date(points[points.length - 1].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' })}
                </text>
              )}
            </g>
          )}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            style={{
              position: 'absolute',
              top: `${(points[hoveredIndex].y / height) * 100}%`,
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              transform: 'translate(-50%, -125%)',
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              boxShadow: 'var(--shadow-lg)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {points[hoveredIndex].val} {config.unit}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              {new Date(points[hoveredIndex].timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ color: points[hoveredIndex].mode === 'device' ? '#34d399' : '#38bdf8', fontSize: '0.675rem', fontWeight: 600, textTransform: 'uppercase' }}>
              {points[hoveredIndex].mode === 'device' ? 'Telemetry Device' : 'Manual Entry'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
