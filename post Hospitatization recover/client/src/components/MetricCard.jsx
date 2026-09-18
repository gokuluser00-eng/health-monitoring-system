import React from 'react';
import { Activity, Heart, Thermometer, Wind, Droplet, Radio, Edit3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  unit,
  targetRange,
  status = "normal", // 'normal', 'warning', 'critical'
  mode = "device", // 'device', 'manual'
  trend = null, // '+2 bpm', '-3%', etc.
  trendDirection = null // 'up', 'down'
}) {
  const getIcon = () => {
    const t = title.toLowerCase();
    if (t.includes('heart') || t.includes('pulse')) return <Heart size={18} color="#ef4444" />;
    if (t.includes('spo2') || t.includes('oxygen')) return <Activity size={18} color="#0284c7" />;
    if (t.includes('temp')) return <Thermometer size={18} color="#f59e0b" />;
    if (t.includes('resp')) return <Wind size={18} color="#8b5cf6" />;
    if (t.includes('glucose') || t.includes('pressure')) return <Droplet size={18} color="#ec4899" />;
    return <Activity size={18} color="#0284c7" />;
  };

  const getStatusBorder = () => {
    if (status === 'critical') return '1px solid #fca5a5';
    if (status === 'warning') return '1px solid #fde68a';
    return '1px solid rgba(226, 232, 240, 0.9)';
  };

  const getStatusBg = () => {
    if (status === 'critical') return 'rgba(254, 242, 242, 0.7)';
    if (status === 'warning') return 'rgba(255, 251, 235, 0.7)';
    return '#ffffff';
  };

  return (
    <div 
      className="glass-panel metric-card" 
      style={{ border: getStatusBorder(), backgroundColor: getStatusBg() }}
    >
      <div className="metric-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {getIcon()}
          <span>{title}</span>
        </div>
        
        {/* Clearly label manually entered vs connected device */}
        {mode === 'device' ? (
          <span className="badge badge-device" title="Data synchronized via connected wearable/telemetry device">
            <Radio size={11} style={{ animation: 'pulse-dot 2s infinite ease-in-out' }} />
            <span>Connected Device</span>
          </span>
        ) : (
          <span className="badge badge-manual" title="Self-reported manual entry by patient">
            <Edit3 size={11} />
            <span>Manual Entry</span>
          </span>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-number">{value !== null && value !== undefined ? value : '--'}</span>
        <span className="metric-unit">{unit}</span>

        {trend && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: status === 'critical' ? '#dc2626' : status === 'warning' ? '#d97706' : '#059669' }}>
            {trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="metric-footer">
        <span style={{ color: 'var(--slate-500)' }}>
          Target: <strong style={{ color: 'var(--slate-700)' }}>{targetRange}</strong>
        </span>
        <span style={{
          fontWeight: 600,
          color: status === 'critical' ? '#dc2626' : status === 'warning' ? '#d97706' : '#059669'
        }}>
          {status === 'critical' ? 'Out of Range (Alert)' : status === 'warning' ? 'Cautionary' : 'Optimal'}
        </span>
      </div>
    </div>
  );
}
