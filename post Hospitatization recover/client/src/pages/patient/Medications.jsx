import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, XCircle, AlertCircle, Calendar, Clock, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Medications() {
  const { user, refreshUser } = useAuth();
  const [medData, setMedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMed, setSelectedMed] = useState(null);
  const [logStatus, setLogStatus] = useState('taken');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMeds = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getMedications(user.id);
      setMedData(data);
    } catch (err) {
      console.error("Error fetching medications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeds();
  }, [user?.id]);

  const handleLogDose = async (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    setSubmitting(true);
    try {
      await api.logMedicationDose(selectedMed.id, {
        status: logStatus,
        reason: reason || (logStatus === 'taken' ? 'Dose taken on schedule' : 'Reported omission')
      });
      setSelectedMed(null);
      setReason('');
      await fetchMeds();
      await refreshUser();
    } catch (err) {
      console.error("Error logging dose:", err);
      alert("Failed to log medication: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Pill size={32} color="#8b5cf6" style={{ animation: 'spin 1.5s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--slate-600)' }}>Loading prescribed medication regimen...</p>
      </div>
    );
  }

  const medications = medData?.medications || [];
  const adherenceRate = medData?.adherenceRate ?? 100;
  const stats = medData?.stats || { total: 0, taken: 0, missed: 0, skipped: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header & Adherence KPI */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffffff, #faf5ff)', border: '1px solid #e9d5ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pill size={24} color="#8b5cf6" />
              Prescription Management & Adherence Tracker
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
              Consistently taking your prescribed medicines is critical to preventing post-hospitalization complications and readmissions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700, display: 'block' }}>
                Overall Adherence
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: adherenceRate >= 80 ? '#10b981' : adherenceRate >= 60 ? '#f59e0b' : '#ef4444' }}>
                {adherenceRate}%
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
              <div><strong style={{ color: '#059669' }}>{stats.taken}</strong> Taken</div>
              <div><strong style={{ color: '#dc2626' }}>{stats.missed}</strong> Missed</div>
              <div><strong style={{ color: '#d97706' }}>{stats.skipped}</strong> Skipped</div>
            </div>
          </div>
        </div>

        {/* Adherence Warning Banner if < 75% */}
        {adherenceRate < 75 && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#991b1b', fontSize: '0.85rem' }}>
            <ShieldAlert size={18} color="#ef4444" />
            <span>
              <strong>Care Warning:</strong> Repeated missed medications increase readmission risk. Your care team (Dr. {user.doctorName}) has been notified to assist with any side effects or scheduling barriers.
            </span>
          </div>
        )}
      </div>

      {/* Medication List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Prescribed Regimen ({medications.length})</h3>

        {medications.map(med => {
          const today = new Date().toISOString().split('T')[0];
          const todayLog = (med.logs || []).find(l => l.date === today);

          return (
            <div key={med.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', borderLeft: med.critical ? '4px solid #ef4444' : '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>{med.name}</h4>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>({med.dosage})</span>
                    {med.critical && (
                      <span style={{ fontSize: '0.675rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                        High Priority
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b21a8', marginTop: '0.2rem', fontWeight: 500 }}>
                    Frequency: {med.frequency} &bull; Scheduled Times: {(med.timeSlots || []).join(', ') || 'Morning'}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--slate-700)', marginTop: '0.35rem' }}>
                    <strong>Clinical Instructions:</strong> {med.instructions}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                    Course: {med.startDate} {med.endDate ? `to ${med.endDate}` : '(Continuous)'}
                  </div>
                </div>

                {/* Dose Logging Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.775rem', color: 'var(--slate-500)' }}>
                    Today's Dose: {todayLog ? (
                      <strong style={{ color: todayLog.status === 'taken' ? '#059669' : todayLog.status === 'missed' ? '#dc2626' : '#d97706', textTransform: 'capitalize' }}>
                        {todayLog.status}
                      </strong>
                    ) : (
                      <span style={{ color: 'var(--slate-400)' }}>Not logged yet</span>
                    )}
                  </span>

                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                    onClick={() => {
                      setSelectedMed(med);
                      setLogStatus(todayLog?.status || 'taken');
                    }}
                  >
                    <span>Record Dose Status</span>
                  </button>
                </div>
              </div>

              {/* Dose History Mini List */}
              {med.logs && med.logs.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                  <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 600 }}>Recent Log History:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                    {med.logs.slice(-5).map((l, idx) => (
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
              )}
            </div>
          );
        })}
      </div>

      {/* Dose Logging Dialog */}
      {selectedMed && (
        <div className="modal-overlay" onClick={() => setSelectedMed(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Log Dose: {selectedMed.name}</h3>
            </div>
            <form onSubmit={handleLogDose}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                  Please confirm whether you took your dose of <strong>{selectedMed.name} {selectedMed.dosage}</strong> today.
                </p>

                <div className="form-group">
                  <label className="form-label">Dose Action</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    {[
                      { id: 'taken', label: 'Taken', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
                      { id: 'missed', label: 'Missed', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                      { id: 'skipped', label: 'Skipped', color: '#d97706', bg: '#fffbeb', border: '#fde68a' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setLogStatus(st.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: logStatus === st.id ? `2px solid ${st.color}` : '1px solid var(--slate-200)',
                          background: logStatus === st.id ? st.bg : '#ffffff',
                          color: logStatus === st.id ? st.color : 'var(--slate-700)',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {logStatus !== 'taken' && (
                  <div className="form-group">
                    <label className="form-label">Reason for Missed/Skipped Dose</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. felt nauseated, ran out of pills, fell asleep..." 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedMed(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Medication Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
