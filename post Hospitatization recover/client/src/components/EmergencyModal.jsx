import React, { useState } from 'react';
import { ShieldAlert, Phone, AlertOctagon, X, CheckCircle2, Hospital, UserCheck, Send } from 'lucide-react';
import { api } from '../services/api';

export default function EmergencyModal({ isOpen, onClose, patient }) {
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const [notes, setNotes] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);

  if (!isOpen) return null;

  const handleNotifyCareTeam = async () => {
    if (!patient) return;
    setNotifying(true);
    try {
      const res = await api.triggerEmergency({
        patientId: patient.id,
        notes: notes || "Patient activated emergency SOS button from dashboard."
      });
      setNotified(true);
      setAlertInfo(res.emergencyInfo);
    } catch (err) {
      console.error("Emergency dispatch error:", err);
      alert("Failed to reach server. Please dial 911 or call your emergency contact directly.");
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderBottom: '1px solid #fca5a5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <AlertOctagon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#991b1b', lineHeight: 1.2 }}>Emergency Assistance Protocol</h2>
              <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600 }}>Post-Acute Medical Support</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Immediate Action Notice */}
          <div style={{ padding: '0.85rem 1rem', background: '#fff1f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecdd3', fontSize: '0.85rem', color: '#9f1239', lineHeight: 1.45 }}>
            <strong>Immediate Safety Instruction:</strong> If you are experiencing severe crushing chest pressure, sudden numbness/weakness in face or arms, difficulty speaking, severe sudden breathlessness, or uncontrolled bleeding, <strong>immediately call 911 (or your local emergency number)</strong>.
          </div>

          {/* Emergency Contacts Card */}
          <div className="glass-panel" style={{ padding: '1rem', background: '#f8fafc', border: '1px solid var(--slate-200)' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={16} color="#0284c7" />
              Direct Emergency Contacts
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Primary Emergency Contact
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)', display: 'block', marginTop: '0.2rem' }}>
                  {patient?.emergencyContactName || "Family Contact"}
                </strong>
                <a 
                  href={`tel:${patient?.emergencyContactPhone || '555-0199'}`} 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', color: '#0284c7', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                >
                  <Phone size={13} />
                  {patient?.emergencyContactPhone || "+1 (555) 234-8902"}
                </a>
              </div>

              <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Discharge Hospital Emergency Line
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)', display: 'block', marginTop: '0.2rem' }}>
                  {patient?.hospitalName || "St. Jude Metropolitan Hospital"}
                </strong>
                <a 
                  href="tel:800-555-9911" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
                >
                  <Hospital size={13} />
                  +1 (800) 555-9911 (ER Hotline)
                </a>
              </div>
            </div>
          </div>

          {/* Trigger Alert to Hospital Care Team */}
          <div className="glass-panel" style={{ padding: '1rem', border: '1px solid #fed7aa', background: '#fffaf5' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send size={16} color="#ea580c" />
              Dispatch Real-Time Alert to Doctor & Care Team
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#7c2d12', marginBottom: '0.75rem' }}>
              Clicking below immediately flags a <strong>CRITICAL PRIORITY</strong> alert on the attending doctor and hospital command center dashboard with your medical record and location.
            </p>

            {notified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', color: '#065f46', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={20} color="#10b981" />
                <span>Critical Alert Dispatched! Dr. {patient?.doctorName || "Sarah Jenkins"} and the On-Call Triage team have been paged.</span>
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Briefly describe what you are feeling (e.g. sudden dizziness, high fever, chest pain)..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}
                />
                <button 
                  className="btn btn-danger" 
                  style={{ width: '100%', gap: '0.5rem' }}
                  onClick={handleNotifyCareTeam}
                  disabled={notifying}
                >
                  <ShieldAlert size={16} />
                  {notifying ? 'Dispatching Priority Alert...' : 'Notify On-Call Care Team & Physician Now'}
                </button>
              </div>
            )}
          </div>

          {/* Regulatory & Safety Clarification */}
          <p style={{ fontSize: '0.725rem', color: 'var(--slate-500)', textAlign: 'center', fontStyle: 'italic' }}>
            Disclaimer: This web application notifies your registered hospital team and displays stored emergency contacts. It does not replace 911 or civil emergency ambulance dispatch services.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
}
