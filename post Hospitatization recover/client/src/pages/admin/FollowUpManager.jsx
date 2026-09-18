import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, AlertCircle, CheckCircle2, User, Hospital, Phone } from 'lucide-react';
import { api } from '../../services/api';

export default function FollowUpManager() {
  const [followups, setFollowups] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // New appointment modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [flwDate, setFlwDate] = useState('');
  const [flwTime, setFlwTime] = useState('11:00 AM');
  const [flwType, setFlwType] = useState('In-Person Outpatient Clinic');
  const [flwClinic, setFlwClinic] = useState('Cardiology Clinic, Suite 402');
  const [flwPurpose, setFlwPurpose] = useState('Post-Discharge 2-Week Sternal & Hemodynamic Check');
  const [flwNotes, setFlwNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const [flwRes, patRes] = await Promise.all([
        api.getFollowups({ status: statusFilter }),
        api.getPatients()
      ]);
      setFollowups(flwRes.followups || []);
      setPatients(patRes.patients || []);
      if (patRes.patients?.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patRes.patients[0].id);
      }
    } catch (err) {
      console.error("Error fetching follow-ups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.scheduleFollowup({
        patientId: selectedPatientId,
        date: flwDate,
        time: flwTime,
        type: flwType,
        clinic: flwClinic,
        purpose: flwPurpose,
        notes: flwNotes
      });
      setModalOpen(false);
      setFlwNotes('');
      await fetchFollowups();
    } catch (err) {
      console.error("Error creating follow-up:", err);
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateFollowup(id, { status });
      await fetchFollowups();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} color="#0284c7" />
            Clinical Follow-Up Management & Appointment Dispatcher
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
            Ensure post-acute transition continuity, track missed visits, and schedule telemetry review appointments.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => {
            setFlwDate(new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>Schedule New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[
          { id: 'all', label: 'All Appointments' },
          { id: 'scheduled', label: 'Upcoming Scheduled' },
          { id: 'missed', label: 'Missed Appointments (Urgent Flags)' },
          { id: 'completed', label: 'Completed' }
        ].map(st => (
          <button
            key={st.id}
            onClick={() => setStatusFilter(st.id)}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: statusFilter === st.id ? 700 : 500,
              borderRadius: 'var(--radius-md)',
              border: statusFilter === st.id ? '1px solid var(--primary-600)' : '1px solid var(--slate-200)',
              background: statusFilter === st.id ? 'var(--primary-50)' : '#ffffff',
              color: statusFilter === st.id ? 'var(--primary-700)' : 'var(--slate-600)',
              cursor: 'pointer'
            }}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Appointment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {followups.map(f => {
          const isMissed = f.status === 'missed';
          const isCompleted = f.status === 'completed';

          return (
            <div 
              key={f.id} 
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderLeft: isMissed ? '5px solid #ef4444' : isCompleted ? '5px solid #10b981' : '5px solid #0284c7',
                background: isMissed ? '#fef2f2' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{f.patientName}</strong>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: isMissed ? '#dc2626' : isCompleted ? '#10b981' : '#0284c7',
                  color: '#ffffff'
                }}>
                  {f.status}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Patient ID: {f.patientId}</div>

              <div style={{ margin: '0.75rem 0', padding: '0.65rem', background: isMissed ? '#ffffff' : 'var(--slate-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {f.date} at {f.time}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '0.15rem', fontWeight: 600 }}>
                  {f.type} &bull; {f.clinic}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                  <strong>Objective:</strong> {f.purpose}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>
                <span>Doctor: {f.doctorName}</span>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {f.status === 'scheduled' && (
                    <>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                        onClick={() => handleUpdateStatus(f.id, 'completed')}
                      >
                        Mark Completed
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                        onClick={() => handleUpdateStatus(f.id, 'missed')}
                      >
                        Flag Missed
                      </button>
                    </>
                  )}
                  {f.status === 'missed' && (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.725rem' }}
                      onClick={() => handleUpdateStatus(f.id, 'scheduled')}
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Dialog */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Schedule Clinical Follow-Up</h3>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Patient</label>
                  <select 
                    className="form-select" 
                    value={selectedPatientId} 
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) - {p.diagnosis?.split('(')[0]?.substring(0, 25)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Appointment Date</label>
                    <input type="date" className="form-input" value={flwDate} onChange={(e) => setFlwDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input type="text" className="form-input" value={flwTime} onChange={(e) => setFlwTime(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Visit Type</label>
                  <select className="form-select" value={flwType} onChange={(e) => setFlwType(e.target.value)}>
                    <option value="In-Person Outpatient Clinic">In-Person Outpatient Clinic</option>
                    <option value="Telehealth Video Consultation">Telehealth Video Consultation</option>
                    <option value="Specialist Urgent Triage">Specialist Urgent Triage</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Clinic</label>
                  <input type="text" className="form-input" value={flwClinic} onChange={(e) => setFlwClinic(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Purpose</label>
                  <input type="text" className="form-input" value={flwPurpose} onChange={(e) => setFlwPurpose(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Preparation Notes for Patient</label>
                  <textarea 
                    className="form-textarea" 
                    rows="2" 
                    placeholder="e.g. Bring your home pill organizers and recent glucose log..."
                    value={flwNotes} 
                    onChange={(e) => setFlwNotes(e.target.value)} 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Scheduling...' : 'Dispatch Schedule & Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
