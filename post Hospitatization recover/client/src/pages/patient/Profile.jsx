import React, { useState, useEffect } from 'react';
import { 
  User, 
  Hospital, 
  AlertCircle, 
  Phone, 
  Heart, 
  FileText, 
  Shield, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  Clock, 
  Activity, 
  Stethoscope, 
  CheckCircle2, 
  Bell 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RiskBadge from '../../components/RiskBadge';

export default function Profile() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      try {
        const data = await api.getPatientById(user.id);
        setPatientData(data.patient);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <User size={32} color="#0284c7" style={{ animation: 'spin 1.5s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--slate-600)' }}>Loading clinical patient profile...</p>
      </div>
    );
  }

  const p = patientData || user;

  // Age group helper (Section 7)
  const getAgeGroupLabel = (age) => {
    if (age <= 17) return 'Children / Adolescents';
    if (age <= 35) return 'Young Adults';
    if (age <= 55) return 'Middle-Aged Adults';
    if (age <= 70) return 'Older Adults';
    return 'Elderly';
  };

  // Visual Symptom & Recovery Timeline (Section 21 Requirement)
  const timelineSteps = [
    { title: 'Hospitalization', date: p.admissionDate || 'Day -10', desc: p.hospitalizationReason || 'Inpatient admission', icon: Hospital, status: 'completed' },
    { title: 'Discharge', date: p.dischargeDate || 'Day -4', desc: p.diagnosis || 'Post-acute discharge with CDSS enrollment', icon: FileText, status: 'completed' },
    { title: 'Daily Symptoms', date: 'Ongoing', desc: 'Patient self-reported fatigue & pain logs', icon: Activity, status: 'completed' },
    { title: 'Vital Changes', date: 'Telemetry', desc: 'Heart rate, SpO2 & blood pressure tracking', icon: TrendingUp, status: 'completed' },
    { title: 'Risk Prediction', date: 'AI Engine', desc: `Current Risk: ${p.currentRiskLevel || 'Low'} (Score: ${p.riskScore || 20})`, icon: Shield, status: 'active' },
    { title: 'Intelligent Alert', date: 'Real-Time', desc: p.currentRiskLevel === 'High Risk' ? 'Early warning flag triggered' : 'Routine monitoring', icon: Bell, status: p.currentRiskLevel === 'High Risk' ? 'warning' : 'completed' },
    { title: 'Admin Review', date: 'Clinical Team', desc: `Assigned: ${p.doctorName || 'Attending Physician'}`, icon: Stethoscope, status: 'active' },
    { title: 'Follow-up', date: p.followUpDate || 'Upcoming', desc: 'Scheduled post-acute outpatient check', icon: Calendar, status: 'upcoming' },
    { title: 'Recovery Target', date: 'Continuous', desc: `Target: 100% (Current Stage: ${p.recoveryStage || 70}%)`, icon: CheckCircle2, status: 'upcoming' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #bbf7d0', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #0f766e)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
              {p.name?.substring(0, 2).toUpperCase() || 'PT'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>{p.name}</h2>
                <RiskBadge level={p.currentRiskLevel || 'Low Risk'} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, marginTop: '0.2rem' }}>
                Patient ID: {p.id} &bull; Age: {p.age} ({getAgeGroupLabel(p.age)}) &bull; Sex: {p.gender}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
              Recovery Stage
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>
              {p.recoveryStage || 70}% <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 600 }}>({p.recoveryTrend || 'Stable'})</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 21: SYMPTOM & RECOVERY TIMELINE */}
      <div className="card" style={{ padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
          <Clock size={20} color="#0284c7" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Patient Symptom &amp; Recovery Timeline
          </h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, background: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
            Continuous Care Continuum
          </span>
        </div>

        {/* Horizontal Visual Timeline */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
          {timelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            const isWarning = step.status === 'warning';

            let bgColor = '#f8fafc';
            let borderColor = 'var(--slate-200)';
            let iconColor = 'var(--slate-400)';

            if (isWarning) {
              bgColor = '#fef2f2';
              borderColor = '#fca5a5';
              iconColor = '#dc2626';
            } else if (isActive) {
              bgColor = '#eff6ff';
              borderColor = '#93c5fd';
              iconColor = '#0284c7';
            } else if (isCompleted) {
              bgColor = '#f0fdf4';
              borderColor = '#bbf7d0';
              iconColor = '#16a34a';
            }

            return (
              <div 
                key={idx} 
                style={{ 
                  flex: '1 1 120px', 
                  minWidth: '130px', 
                  background: bgColor, 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
                    <Icon size={14} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    #{idx + 1}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.2rem' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: iconColor, fontWeight: 700, marginBottom: '0.25rem' }}>
                  {step.date}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-600)', lineHeight: 1.3, marginTop: 'auto' }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 10: COMPLETE PATIENT PROFILE (4 Structured Categories) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem' }}>
        
        {/* 1. PERSONAL INFORMATION (Section 10) */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <User size={18} color="#0284c7" />
            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>1. Personal Information</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Full Name</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.name}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Patient ID</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.id}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Age / Gender</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.age} years old &bull; {p.gender}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Blood Group</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.bloodGroup || 'O+'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Primary Phone</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.phone}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Email</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.email}</strong>
            </div>
            <div style={{ gridColumn: '1 / -1', background: '#fee2e2', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: '#991b1b', display: 'block', fontSize: '0.75rem', fontWeight: 700 }}>Emergency Contact</span>
              <strong style={{ color: '#7f1d1d' }}>{p.emergencyContactName} &bull; {p.emergencyContactPhone}</strong>
            </div>
          </div>
        </div>

        {/* 2. MEDICAL INFORMATION (Section 10) */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <Heart size={18} color="#ef4444" />
            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>2. Medical Information</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Primary Disease Category</span>
              <strong style={{ color: '#0284c7', fontSize: '0.95rem' }}>{p.disease || p.diseaseCategory}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Existing Conditions</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                {(p.existingConditions || []).map((cond, i) => (
                  <span key={i} style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {cond}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Allergies</span>
              <span style={{ color: '#dc2626', fontWeight: 700 }}>
                {Array.isArray(p.allergies) ? p.allergies.join(', ') : p.allergies || 'None known'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Current Medications</span>
              <div style={{ color: 'var(--slate-800)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                {Array.isArray(p.currentMedications) ? p.currentMedications.join(' • ') : p.currentMedications}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Previous Medical History</span>
              <div style={{ color: 'var(--slate-700)', fontSize: '0.8rem' }}>{p.medicalHistory}</div>
            </div>
          </div>
        </div>

        {/* 3. HOSPITALIZATION INFORMATION (Section 10) */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <Hospital size={18} color="#0f766e" />
            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>3. Hospitalization Information</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Hospital Facility</span>
              <strong style={{ color: 'var(--slate-900)' }}>{p.hospitalName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Admission Date</span>
              <strong style={{ color: 'var(--slate-800)' }}>{p.admissionDate}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Discharge Date</span>
              <strong style={{ color: 'var(--slate-800)' }}>{p.dischargeDate}</strong>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Reason for Hospitalization</span>
              <div style={{ color: 'var(--slate-800)', fontWeight: 600 }}>{p.hospitalizationReason}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Healthcare Professional Diagnosis</span>
              <div style={{ color: '#0369a1', fontWeight: 700 }}>{p.diagnosis}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Attending Doctor</span>
              <strong style={{ color: 'var(--slate-800)' }}>{p.doctorName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Follow-Up Date</span>
              <strong style={{ color: '#0f766e', fontWeight: 700 }}>{p.followUpDate}</strong>
            </div>
          </div>
        </div>

        {/* 4. RECOVERY INFORMATION (Section 10) */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <TrendingUp size={18} color="#16a34a" />
            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>4. Recovery Information</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Age Group Cohort</span>
              <strong style={{ color: 'var(--slate-800)' }}>{getAgeGroupLabel(p.age)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Disease Category</span>
              <strong style={{ color: '#0284c7' }}>{p.disease || p.diseaseCategory}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Current Recovery Stage</span>
              <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>{p.recoveryStage || 70}%</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Risk Level</span>
              <RiskBadge level={p.currentRiskLevel || 'Low Risk'} />
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Recovery Trend</span>
              <strong style={{ color: p.recoveryTrend === 'Guarded' ? '#d97706' : '#16a34a' }}>
                {p.recoveryTrend || 'Stable'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Last Health Check-In</span>
              <strong style={{ color: 'var(--slate-800)' }}>{p.lastCheckInDate || 'Today'}</strong>
            </div>
            <div style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Personalized Baseline Profile</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)', marginTop: '0.2rem' }}>
                Target HR: {p.baseline?.heartRateMin || 68}–{p.baseline?.heartRateMax || 82} bpm &bull; Systolic: {p.baseline?.bloodPressureSysMin || 115}–{p.baseline?.bloodPressureSysMax || 130} mmHg
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
