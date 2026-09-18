import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  User, 
  Hospital, 
  Heart, 
  Calendar, 
  Pill, 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Send, 
  AlertTriangle, 
  Sparkles,
  TrendingUp,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import VitalsChart from '../../components/VitalsChart';
import RiskBadge from '../../components/RiskBadge';

export default function PatientDetailView({ patientId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals', 'symptoms', 'medications', 'ai_risk', 'alerts', 'message'
  
  // Message form state
  const [msgContent, setMsgContent] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgCategory, setMsgCategory] = useState('instruction');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);

  // Follow-up form state
  const [followupModalOpen, setFollowupModalOpen] = useState(false);
  const [flwDate, setFlwDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
  const [flwTime, setFlwTime] = useState('10:00 AM');
  const [flwType, setFlwType] = useState('Clinic Outpatient');
  const [flwPurpose, setFlwPurpose] = useState('Hemodynamic & Vital Review');

  const fetchPatientDetail = async () => {
    if (!patientId) return;
    try {
      const res = await api.getPatientById(patientId);
      setData(res);
    } catch (err) {
      console.error("Error fetching patient details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetail();
  }, [patientId]);

  const handleUpdateAlert = async (alertId, newStatus) => {
    try {
      await api.updateAlertStatus(alertId, {
        status: newStatus,
        notes: `Actioned by Attending Physician at ${new Date().toLocaleTimeString()}`
      });
      await fetchPatientDetail();
    } catch (err) {
      console.error("Failed to update alert:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    setSendingMsg(true);
    try {
      await api.sendMessage({
        patientId,
        senderRole: 'doctor',
        senderName: data?.patient?.doctorName || 'Dr. Sarah Jenkins, MD',
        recipientRole: 'patient',
        subject: msgSubject || 'Clinical Care Guidance & Follow-up',
        category: msgCategory,
        content: msgContent
      });
      setMsgContent('');
      setMsgSubject('');
      setMsgSuccess(true);
      setTimeout(() => setMsgSuccess(false), 3000);
      await fetchPatientDetail();
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Error sending message: " + err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleScheduleFollowup = async (e) => {
    e.preventDefault();
    try {
      await api.scheduleFollowup({
        patientId,
        date: flwDate,
        time: flwTime,
        type: flwType,
        purpose: flwPurpose
      });
      setFollowupModalOpen(false);
      await fetchPatientDetail();
    } catch (err) {
      console.error("Failed to schedule follow-up:", err);
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Activity size={32} color="#0284c7" style={{ animation: 'spin 1.5s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--slate-600)' }}>Opening Patient 360° Electronic Health Profile...</p>
      </div>
    );
  }

  if (!data || !data.patient) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Patient record could not be loaded.</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1rem' }}>
          &larr; Back to Patient Census
        </button>
      </div>
    );
  }

  const { patient, checkins, medications, adherenceStats, alerts, followups, messages, latestCheckin } = data;
  const currentRisk = patient.currentRiskLevel || 'Low Risk';
  const riskScore = patient.riskScore || 20;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back Button & Patient Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Census</span>
        </button>
        <span style={{ color: 'var(--slate-400)' }}>/</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>Patient 360° Clinical Dossier</span>
      </div>

      {/* Patient Profile Masthead */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffffff, #f8fafc)', border: '1px solid var(--slate-200)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--slate-900)' }}>{patient.name}</h2>
              <span style={{ fontSize: '0.825rem', background: 'var(--slate-100)', color: 'var(--slate-700)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                {patient.id}
              </span>
              <RiskBadge level={currentRisk} score={riskScore} />
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <span>{patient.age} yrs &bull; {patient.gender}</span>
              <span>Blood Group: <strong>{patient.bloodGroup || 'A+'}</strong></span>
              <span>Hospital: <strong>{patient.hospitalName}</strong></span>
              <span>Attending: <strong>{patient.doctorName}</strong></span>
            </div>

            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: '#f0f9ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bae6fd', display: 'inline-block', fontSize: '0.85rem', color: '#0369a1' }}>
              <strong>Discharge Diagnosis:</strong> {patient.diagnosis} (Discharged: {patient.dischargeDate})
            </div>
          </div>

          {/* Quick Doctor Actions */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={() => setActiveTab('message')}
            >
              <Send size={14} />
              <span>Send Directive</span>
            </button>
            <button 
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              onClick={() => setFollowupModalOpen(true)}
            >
              <Calendar size={14} />
              <span>Schedule Follow-Up</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'vitals', label: 'Vitals & Telemetry', icon: Activity },
          { id: 'ai_risk', label: 'AI Risk Deep-Dive', icon: Sparkles },
          { id: 'alerts', label: `Alerts (${alerts.filter(a => a.status !== 'resolved').length})`, icon: Bell },
          { id: 'medications', label: `Medications (${adherenceStats.adherenceRate}%)`, icon: Pill },
          { id: 'symptoms', label: 'Symptom History', icon: Heart },
          { id: 'profile', label: 'Demographics & History', icon: User },
          { id: 'message', label: 'Direct Messaging', icon: Send }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VITALS MONITORING & CHARTS */}
      {activeTab === 'vitals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <VitalsChart checkins={checkins} />

          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
              Latest Check-In Clinical Findings
            </h3>

            {latestCheckin ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Oxygen Saturation</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: latestCheckin.spO2 <= 92 ? '#dc2626' : '#0284c7' }}>
                    {latestCheckin.spO2}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>Mode: {latestCheckin.measurementMode}</span>
                </div>

                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Resting Heart Rate</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: latestCheckin.heartRate >= 105 ? '#dc2626' : 'var(--slate-900)' }}>
                    {latestCheckin.heartRate} bpm
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Blood Pressure</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {latestCheckin.bloodPressureSys}/{latestCheckin.bloodPressureDia || '--'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Core Temperature</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: latestCheckin.temperature >= 38.2 ? '#dc2626' : 'var(--slate-900)' }}>
                    {latestCheckin.temperature}°C
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--slate-500)' }}>No check-in telemetry recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI RISK ANALYSIS DEEP DIVE */}
      {activeTab === 'ai_risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: currentRisk === 'High Risk' ? '6px solid #ef4444' : currentRisk === 'Moderate Risk' ? '6px solid #f59e0b' : '6px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={22} color="#0284c7" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>AI Multi-Factorial Risk Stratification</h3>
              </div>
              <RiskBadge level={currentRisk} score={riskScore} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                  Model-Identified Risk Contributors
                </h4>
                <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(latestCheckin?.contributingFactors || ["Standard recovery parameters"]).map((factor, i) => (
                    <li key={i} style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)', fontSize: '0.85rem', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={15} color={currentRisk === 'High Risk' ? '#ef4444' : '#f59e0b'} />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                  Clinical Decision Recommendation
                </h4>
                <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', fontSize: '0.9rem', color: '#0369a1', lineHeight: 1.5 }}>
                  {latestCheckin?.recommendedAction || "Patient is currently stable. Maintain scheduled follow-up and monitoring."}
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fafafa', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                  Validation Disclaimer: This algorithmic prediction is calibrated on NEWS2 vital corridors, medication adherence delta, and compound symptom clustering to support clinical decision-making. Final therapeutic decisions rest with the licensed clinician.
                </div>
              </div>
            </div>
          </div>

          {/* Historical Predictions Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>Historical Risk Trajectory Log</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Risk Category</th>
                    <th>Score</th>
                    <th>SpO2</th>
                    <th>Pulse</th>
                    <th>Reported Symptoms</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((c, i) => (
                    <tr key={i}>
                      <td>{new Date(c.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td><RiskBadge level={c.riskLevel} size="sm" /></td>
                      <td><strong>{c.riskScore}%</strong></td>
                      <td>{c.spO2}%</td>
                      <td>{c.heartRate} bpm</td>
                      <td>
                        {[
                          c.chestDiscomfort ? 'Chest Discomfort' : null,
                          c.breathingDifficulty ? 'Dyspnea' : null,
                          c.dizziness ? 'Dizziness' : null,
                          c.swelling ? 'Edema' : null
                        ].filter(Boolean).join(', ') || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ALERT MANAGEMENT */}
      {activeTab === 'alerts' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>
            Patient Alert Center ({alerts.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.length === 0 ? (
              <p style={{ color: 'var(--slate-500)' }}>No active or past alerts for this patient.</p>
            ) : (
              alerts.map(a => (
                <div 
                  key={a.id} 
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${a.severity === 'critical' ? '#fca5a5' : a.severity === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                    background: a.severity === 'critical' ? '#fef2f2' : a.severity === 'warning' ? '#fffbeb' : '#eff6ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: a.severity === 'critical' ? '#dc2626' : '#d97706', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
                          {a.severity}
                        </span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{a.type}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>({a.id})</span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-800)', marginTop: '0.35rem' }}>
                        Trigger: <strong>{a.triggeringParameter}</strong> &bull; Current: <strong>{a.currentValue}</strong> &bull; Baseline: <span>{a.previousValue}</span>
                      </div>

                      <p style={{ fontSize: '0.825rem', color: 'var(--slate-700)', marginTop: '0.3rem' }}>
                        {a.trendSummary}
                      </p>

                      <div style={{ fontSize: '0.775rem', color: 'var(--slate-600)', marginTop: '0.4rem', background: 'rgba(255,255,255,0.7)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Action Needed:</strong> {a.recommendedAction}
                      </div>

                      {a.notes && (
                        <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.35rem' }}>
                          <strong>Resolution Log:</strong> {a.notes}
                        </div>
                      )}
                    </div>

                    {/* Status Management Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--slate-500)' }}>
                        Status: <strong style={{ color: a.status === 'resolved' ? '#059669' : a.status === 'under_review' ? '#0284c7' : '#dc2626' }}>{a.status}</strong>
                      </span>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {a.status === 'new' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateAlert(a.id, 'acknowledged')}
                          >
                            Acknowledge
                          </button>
                        )}
                        {a.status !== 'under_review' && a.status !== 'resolved' && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateAlert(a.id, 'under_review')}
                          >
                            Under Review
                          </button>
                        )}
                        {a.status !== 'resolved' && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', background: '#059669' }}
                            onClick={() => handleUpdateAlert(a.id, 'resolved')}
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MEDICATION ADHERENCE */}
      {activeTab === 'medications' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Medication Adherence Audit</h3>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: adherenceStats.adherenceRate >= 75 ? '#059669' : '#dc2626' }}>
              Adherence Rate: {adherenceStats.adherenceRate}%
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {medications.map(m => (
              <div key={m.id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>{m.name} ({m.dosage})</strong>
                  {m.critical && <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>CRITICAL</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                  {m.frequency} &bull; {m.instructions}
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.725rem', color: 'var(--slate-500)', fontWeight: 600 }}>Dose Compliance Log:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {(m.logs || []).map((l, idx) => (
                      <span 
                        key={idx} 
                        style={{
                          fontSize: '0.725rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: l.status === 'taken' ? '#ecfdf5' : l.status === 'missed' ? '#fef2f2' : '#fffbeb',
                          color: l.status === 'taken' ? '#065f46' : l.status === 'missed' ? '#991b1b' : '#92400e',
                          border: `1px solid ${l.status === 'taken' ? '#a7f3d0' : l.status === 'missed' ? '#fecaca' : '#fde68a'}`
                        }}
                      >
                        {l.date}: <strong>{l.status}</strong> {l.reason ? `(${l.reason})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYMPTOMS TIMELINE */}
      {activeTab === 'symptoms' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: '1rem' }}>Reported Symptoms Timeline</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {checkins.map((c, i) => (
              <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong>{new Date(c.timestamp).toLocaleString()}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span>Pain: <strong>{c.painLevel}/10</strong></span>
                    <span>Fatigue: <strong>{c.fatigueLevel}/10</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.5rem 0' }}>
                  {c.chestDiscomfort && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Chest Discomfort</span>}
                  {c.breathingDifficulty && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Breathing Difficulty</span>}
                  {c.swelling && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Edema</span>}
                  {c.dizziness && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Dizziness</span>}
                </div>
                {c.notes && <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontStyle: 'italic' }}>"{c.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DEMOGRAPHICS & HOSPITALIZATION */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>Personal & Emergency</h3>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Address:</strong> {patient.address}</div>
              <div><strong>Phone:</strong> {patient.phone}</div>
              <div><strong>Emergency Contact:</strong> {patient.emergencyContactName} ({patient.emergencyContactPhone})</div>
              <div><strong>Blood Group:</strong> {patient.bloodGroup}</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>Hospitalization Record</h3>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Hospital:</strong> {patient.hospitalName}</div>
              <div><strong>Admission Date:</strong> {patient.admissionDate}</div>
              <div><strong>Discharge Date:</strong> {patient.dischargeDate}</div>
              <div><strong>Reason:</strong> {patient.hospitalizationReason}</div>
              <div><strong>Discharge Instructions:</strong> {patient.dischargeInstructions}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DIRECT MESSAGING */}
      {activeTab === 'message' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
            Send Clinical Instruction or Alert Follow-Up
          </h3>

          {msgSuccess && (
            <div style={{ padding: '0.75rem', background: '#ecfdf5', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>Message sent to patient dashboard and notification banner!</span>
            </div>
          )}

          <form onSubmit={handleSendMessage}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={msgCategory} onChange={(e) => setMsgCategory(e.target.value)}>
                  <option value="instruction">Clinical Instruction</option>
                  <option value="alert_followup">Alert Triage Directive</option>
                  <option value="reminder">Medication / Appointment Reminder</option>
                  <option value="general">General Clinical Check-In</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Urgent: Please sit upright and retake SpO2..."
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Instruction Details</label>
              <textarea 
                className="form-textarea" 
                rows="4" 
                placeholder="Type specific recovery guidance, dosage modification, or appointment instruction..."
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={sendingMsg}>
                <Send size={15} />
                <span>{sendingMsg ? 'Transmitting...' : 'Dispatch Instruction to Patient'}</span>
              </button>
            </div>
          </form>

          {/* Conversation history */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-800)', marginBottom: '0.75rem' }}>Communication Stream</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {messages.map(m => (
                <div key={m.id} style={{ padding: '0.75rem 1rem', background: m.senderRole === 'doctor' ? '#f0f9ff' : '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.2rem' }}>
                    <strong>{m.senderName} ({m.senderRole})</strong>
                    <span>{new Date(m.timestamp).toLocaleString()}</span>
                  </div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--slate-900)' }}>{m.subject}</strong>
                  <p style={{ fontSize: '0.825rem', color: 'var(--slate-700)', marginTop: '0.2rem' }}>{m.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Follow-Up Schedule Modal */}
      {followupModalOpen && (
        <div className="modal-overlay" onClick={() => setFollowupModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Schedule Clinical Follow-Up</h3>
            </div>
            <form onSubmit={handleScheduleFollowup}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Appointment Date</label>
                  <input type="date" className="form-input" value={flwDate} onChange={(e) => setFlwDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Appointment Time</label>
                  <input type="text" className="form-input" value={flwTime} onChange={(e) => setFlwTime(e.target.value)} placeholder="e.g. 10:30 AM" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Visit Type</label>
                  <select className="form-select" value={flwType} onChange={(e) => setFlwType(e.target.value)}>
                    <option value="Clinic Outpatient">In-Person Outpatient Clinic</option>
                    <option value="Telehealth Video">Telehealth Video Consult</option>
                    <option value="Urgent Cardiac Check">Urgent Sub-specialty Assessment</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose / Clinical Objective</label>
                  <input type="text" className="form-input" value={flwPurpose} onChange={(e) => setFlwPurpose(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setFollowupModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm & Notify Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
