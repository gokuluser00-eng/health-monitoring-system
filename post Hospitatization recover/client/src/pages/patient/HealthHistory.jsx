import React, { useState, useEffect } from 'react';
import { 
  History, 
  Activity, 
  FileText, 
  Calendar, 
  Pill, 
  Bell, 
  Radio, 
  Edit3, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import VitalsChart from '../../components/VitalsChart';
import RiskBadge from '../../components/RiskBadge';

export default function HealthHistory() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('charts'); // 'charts', 'readings', 'symptoms', 'alerts'

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        const data = await api.getPatientById(user.id);
        setPatientData(data);
      } catch (err) {
        console.error("Error fetching health history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Activity size={32} color="#0284c7" style={{ animation: 'spin 1.5s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--slate-600)' }}>Retrieving longitudinal health history...</p>
      </div>
    );
  }

  const checkins = patientData?.checkins || [];
  const alerts = patientData?.alerts || [];
  const patient = patientData?.patient || user;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="#0284c7" />
            Longitudinal Health History & Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
            Track your recovery trajectory, historical vital sign readings, and care team interventions over time.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '0.25rem', borderRadius: 'var(--radius-md)', gap: '0.25rem' }}>
          {[
            { id: 'charts', label: 'Vitals Analytics' },
            { id: 'readings', label: 'Detailed Logs' },
            { id: 'symptoms', label: 'Symptom Timeline' },
            { id: 'alerts', label: 'Risk Alerts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-700)' : 'var(--slate-600)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts View */}
      {activeTab === 'charts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <VitalsChart checkins={checkins} />

          {/* AI Risk Score Trend Mini Overview */}
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={18} color="#0284c7" />
              AI Risk Score Progression (0 - 100%)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {checkins.slice(-4).map((c, i) => (
                <div key={i} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--slate-500)' }}>
                    {new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      {c.riskScore || 20}%
                    </span>
                    <RiskBadge level={c.riskLevel || 'Low Risk'} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--slate-600)', marginTop: '0.4rem' }}>
                    SpO2: <strong>{c.spO2}%</strong> | HR: <strong>{c.heartRate} bpm</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table of Readings */}
      {activeTab === 'readings' && (
        <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Source Mode</th>
                  <th>SpO2</th>
                  <th>Heart Rate</th>
                  <th>Blood Pressure</th>
                  <th>Temperature</th>
                  <th>Resp Rate</th>
                  <th>Glucose</th>
                  <th>Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      {c.measurementMode === 'device' ? (
                        <span className="badge badge-device">
                          <Radio size={11} /> Device
                        </span>
                      ) : (
                        <span className="badge badge-manual">
                          <Edit3 size={11} /> Manual
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: c.spO2 <= 92 ? '#dc2626' : '#0284c7' }}>{c.spO2}%</strong>
                    </td>
                    <td>
                      <strong style={{ color: c.heartRate >= 105 ? '#dc2626' : '#334155' }}>{c.heartRate} bpm</strong>
                    </td>
                    <td>
                      {c.bloodPressureSys}/{c.bloodPressureDia || '--'} mmHg
                    </td>
                    <td>
                      {c.temperature}°C
                    </td>
                    <td>
                      {c.respiratoryRate ? `${c.respiratoryRate} /min` : '--'}
                    </td>
                    <td>
                      {c.bloodGlucose ? `${c.bloodGlucose} mg/dL` : '--'}
                    </td>
                    <td>
                      <RiskBadge level={c.riskLevel || 'Low Risk'} score={c.riskScore} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Symptom Progression Log */}
      {activeTab === 'symptoms' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checkins.map((c, i) => (
              <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{new Date(c.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      Pain: {c.painLevel}/10
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      Fatigue: {c.fatigueLevel}/10
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
                  {c.chestDiscomfort && (
                    <span style={{ fontSize: '0.725rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Chest Discomfort
                    </span>
                  )}
                  {c.breathingDifficulty && (
                    <span style={{ fontSize: '0.725rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Breathing Difficulty
                    </span>
                  )}
                  {c.dizziness && (
                    <span style={{ fontSize: '0.725rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Dizziness
                    </span>
                  )}
                  {c.swelling && (
                    <span style={{ fontSize: '0.725rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Peripheral Swelling
                    </span>
                  )}
                  {c.nausea && (
                    <span style={{ fontSize: '0.725rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      Nausea
                    </span>
                  )}
                  {!c.chestDiscomfort && !c.breathingDifficulty && !c.dizziness && !c.swelling && !c.nausea && (
                    <span style={{ fontSize: '0.725rem', background: '#ecfdf5', color: '#065f46', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      No Acute Symptoms
                    </span>
                  )}
                </div>

                {c.notes && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', fontStyle: 'italic', marginTop: '0.35rem' }}>
                    "{c.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Alerts */}
      {activeTab === 'alerts' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>No early warning alerts recorded for your profile.</p>
            ) : (
              alerts.map(a => (
                <div 
                  key={a.id} 
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${a.severity === 'critical' ? '#fca5a5' : a.severity === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                    background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'warning' ? '#fffbeb' : '#eff6ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                      {a.type}: {a.triggeringParameter}
                    </strong>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: a.status === 'resolved' ? '#10b981' : a.severity === 'critical' ? '#ef4444' : '#f59e0b',
                      color: '#ffffff'
                    }}>
                      {a.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--slate-700)' }}>
                    {a.trendSummary}
                  </div>

                  <div style={{ marginTop: '0.5rem', fontSize: '0.775rem', color: 'var(--slate-600)', background: 'rgba(255,255,255,0.7)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Recommended Action:</strong> {a.recommendedAction}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.4rem' }}>
                    Logged: {new Date(a.timestamp).toLocaleString()}
                    {a.notes && ` &bull; Clinical Notes: ${a.notes}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
