import React from 'react';
import { AlertTriangle, ShieldAlert, X, ChevronRight, Bell } from 'lucide-react';

export default function NotificationBanner({ alerts = [], onReview = null, onClose = null }) {
  const activeAlerts = alerts.filter(a => a.status === 'new' || a.status === 'acknowledged');
  if (activeAlerts.length === 0) return null;

  const topAlert = activeAlerts[0];
  const isCritical = topAlert.severity === 'critical';

  return (
    <div 
      className="alert-banner"
      style={{
        background: isCritical ? '#fef2f2' : '#fffbeb',
        border: `1px solid ${isCritical ? '#fecaca' : '#fde68a'}`,
        color: isCritical ? '#991b1b' : '#92400e'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: isCritical ? '#fee2e2' : '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {isCritical ? <ShieldAlert size={18} color="#ef4444" /> : <AlertTriangle size={18} color="#d97706" />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong style={{ fontSize: '0.9rem' }}>
              {topAlert.type}: {topAlert.triggeringParameter} ({topAlert.currentValue})
            </strong>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.1rem 0.4rem', borderRadius: '4px', background: isCritical ? '#dc2626' : '#d97706', color: '#fff', fontWeight: 700 }}>
              {topAlert.severity}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', marginTop: '0.1rem', opacity: 0.9 }}>
            {topAlert.trendSummary || topAlert.recommendedAction}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {onReview && (
          <button 
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.775rem',
              background: isCritical ? '#ef4444' : '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={() => onReview(topAlert)}
          >
            <span>Review Action</span>
            <ChevronRight size={13} />
          </button>
        )}
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCritical ? '#991b1b' : '#92400e' }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
