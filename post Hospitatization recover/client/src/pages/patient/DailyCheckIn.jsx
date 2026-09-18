import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplet, 
  Radio, 
  Edit3, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Clock,
  Calendar,
  Building,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RiskBadge from '../../components/RiskBadge';

export default function DailyCheckIn({ onComplete }) {
  const { user, refreshUser } = useAuth();

  // Disease category to dynamically tailor the inputs
  const disease = user?.disease || user?.diseaseCategory || 'Hypertension';

  // Data Source / Measurement Origin (Section 11 Requirement)
  const [measurementMode, setMeasurementMode] = useState('manual'); // 'manual', 'device', 'hospital'
  const [isSimulatingDevice, setIsSimulatingDevice] = useState(false);

  // Date and Time (Section 11 Requirement)
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));

  // Dynamic Vitals State
  const [heartRate, setHeartRate] = useState('76');
  const [spO2, setSpO2] = useState('98');
  const [temperature, setTemperature] = useState('36.8');
  const [bloodPressureSys, setBloodPressureSys] = useState('124');
  const [bloodPressureDia, setBloodPressureDia] = useState('80');
  const [respiratoryRate, setRespiratoryRate] = useState('16');
  const [bloodGlucose, setBloodGlucose] = useState('115');
  const [peakFlow, setPeakFlow] = useState('420');
  const [weight, setWeight] = useState('74.5');
  const [urineChanges, setUrineChanges] = useState('Normal clear amber');
  const [meals, setMeals] = useState('Standard low-sodium meals taken');
  const [medicationStatus, setMedicationStatus] = useState('All taken as prescribed');

  // Subjective Symptoms (Section 11 Requirement: Pain Severity, Fatigue, Energy Level - NO bracketed text!)
  const [painLevel, setPainLevel] = useState(2);
  const [fatigueLevel, setFatigueLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(7);

  // Symptoms Checkboxes
  const [cough, setCough] = useState(false);
  const [breathingDifficulty, setBreathingDifficulty] = useState(false);
  const [chestDiscomfort, setChestDiscomfort] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [nausea, setNausea] = useState(false);
  const [swelling, setSwelling] = useState(false);
  const [appetite, setAppetite] = useState('Normal');
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [otherSymptoms, setOtherSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Submission & Result Modal
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Simulate Connected Device Telemetry
  const simulateDeviceSync = () => {
    setIsSimulatingDevice(true);
    setMeasurementMode('device');
    setTimeout(() => {
      setHeartRate(String(Math.floor(72 + Math.random() * 8)));
      setSpO2(String(Math.floor(96 + Math.random() * 3)));
      setTemperature((36.6 + Math.random() * 0.4).toFixed(1));
      setRespiratoryRate(String(Math.floor(15 + Math.random() * 3)));
      if (disease === 'Diabetes') {
        setBloodGlucose(String(Math.floor(105 + Math.random() * 25)));
      }
      if (disease === 'Asthma') {
        setPeakFlow(String(Math.floor(410 + Math.random() * 40)));
      }
      setIsSimulatingDevice(false);
    }, 650);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        patientId: user.id,
        date: checkInDate,
        time: checkInTime,
        measurementMode,
        heartRate,
        spO2,
        temperature,
        bloodPressureSys,
        bloodPressureDia,
        respiratoryRate,
        bloodGlucose: disease === 'Diabetes' ? bloodGlucose : null,
        peakFlow: disease === 'Asthma' ? peakFlow : null,
        weight: (disease === 'Hypertension' || disease === 'Diabetes' || disease === 'Chronic Kidney Disease') ? weight : null,
        urineChanges: disease === 'Chronic Kidney Disease' ? urineChanges : null,
        meals,
        medicationStatus,
        painLevel,
        fatigueLevel,
        energyLevel,
        cough,
        breathingDifficulty,
        chestDiscomfort,
        dizziness,
        nausea,
        swelling,
        appetite,
        sleepQuality,
        otherSymptoms,
        notes
      };

      const res = await api.submitCheckin(payload);
      setResult(res);
      await refreshUser();
    } catch (err) {
      alert(err.message || 'Error submitting check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Page Header (STRICTLY NO profile data as per Section 11) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              <ClipboardCheck size={14} />
              <span>Daily Health Monitoring &bull; {disease}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Daily Health Check-In
            </h1>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              Record your current health monitoring parameters. Inputs dynamically adapt to your condition.
            </p>
          </div>

          {/* Connected Device / Source Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.4rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--slate-300)', boxShadow: 'var(--shadow-sm)' }}>
            <button
              type="button"
              onClick={() => setMeasurementMode('manual')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: measurementMode === 'manual' ? '#0284c7' : 'transparent',
                color: measurementMode === 'manual' ? '#ffffff' : 'var(--slate-600)',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={14} />
              <span>Manual Entry</span>
            </button>

            <button
              type="button"
              onClick={simulateDeviceSync}
              disabled={isSimulatingDevice}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: measurementMode === 'device' ? '#0f766e' : 'transparent',
                color: measurementMode === 'device' ? '#ffffff' : 'var(--slate-600)',
                cursor: 'pointer'
              }}
            >
              <Radio size={14} className={isSimulatingDevice ? 'spin' : ''} />
              <span>{isSimulatingDevice ? 'Syncing Sensors...' : 'Connected Device'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMeasurementMode('hospital')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: measurementMode === 'hospital' ? '#7c3aed' : 'transparent',
                color: measurementMode === 'hospital' ? '#ffffff' : 'var(--slate-600)',
                cursor: 'pointer'
              }}
            >
              <Building size={14} />
              <span>Hospital Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Date and Time Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--slate-500)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>Record Date:</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ padding: '0.35rem 0.6rem', width: 'auto', fontSize: '0.85rem' }} 
              value={checkInDate}
              onChange={e => setCheckInDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="var(--slate-500)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>Record Time:</span>
            <input 
              type="time" 
              className="form-input" 
              style={{ padding: '0.35rem 0.6rem', width: 'auto', fontSize: '0.85rem' }} 
              value={checkInTime}
              onChange={e => setCheckInTime(e.target.value)}
              required
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            <span>Source Tag:</span>
            <span style={{ 
              fontWeight: 700, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '9999px',
              background: measurementMode === 'device' ? '#ccfbf1' : (measurementMode === 'hospital' ? '#ede9fe' : '#e0f2fe'),
              color: measurementMode === 'device' ? '#0f766e' : (measurementMode === 'hospital' ? '#6d28d9' : '#0284c7')
            }}>
              {measurementMode === 'device' ? 'Connected Bluetooth Sensor' : (measurementMode === 'hospital' ? 'Hospital Outpatient EMR' : 'Patient Self-Entry')}
            </span>
          </div>
        </div>

        {/* SECTION 1: VITAL SIGNS (DISEASE SPECIFIC DYNAMIC FIELDS - Section 12) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
            <Activity size={20} color="#0284c7" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              1. Vital Signs &bull; {disease} Parameters
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            
            {/* Heart Rate (Relevant to Heart Disease, Hypertension, Asthma) */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Heart size={14} color="#ef4444" />
                <span>Heart Rate (bpm) *</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={heartRate}
                onChange={e => setHeartRate(e.target.value)}
                min="40" 
                max="200" 
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Target: 60 - 100 bpm</span>
            </div>

            {/* Blood Pressure (Relevant to Hypertension, Diabetes, Heart Disease, CKD) */}
            <div>
              <label className="form-label">Blood Pressure (Systolic / Diastolic) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Sys" 
                  value={bloodPressureSys}
                  onChange={e => setBloodPressureSys(e.target.value)}
                  min="70" 
                  max="240" 
                  required
                />
                <span style={{ color: 'var(--slate-400)', fontWeight: 700 }}>/</span>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Dia" 
                  value={bloodPressureDia}
                  onChange={e => setBloodPressureDia(e.target.value)}
                  min="40" 
                  max="140" 
                  required
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>mmHg</span>
              </div>
            </div>

            {/* SpO2 (Relevant to Asthma, Heart Disease, Hypertension) */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wind size={14} color="#0284c7" />
                <span>SpO2 Oxygen Saturation (%) *</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={spO2}
                onChange={e => setSpO2(e.target.value)}
                min="70" 
                max="100" 
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Target: 95 - 100%</span>
            </div>

            {/* Respiratory Rate */}
            <div>
              <label className="form-label">Respiratory Rate (breaths/min)</label>
              <input 
                type="number" 
                className="form-input" 
                value={respiratoryRate}
                onChange={e => setRespiratoryRate(e.target.value)}
                min="8" 
                max="45"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Target: 12 - 20 bpm</span>
            </div>

            {/* Body Temperature */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Thermometer size={14} color="#f97316" />
                <span>Body Temperature (°C)</span>
              </label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                min="34" 
                max="42"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Normal: 36.5 - 37.5 °C</span>
            </div>

            {/* DYNAMIC: Blood Glucose (Shown for Diabetes Patients as per Section 12) */}
            {disease === 'Diabetes' && (
              <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                <label className="form-label" style={{ color: '#92400e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Droplet size={14} color="#b45309" />
                  <span>Blood Glucose (mg/dL) *</span>
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={bloodGlucose}
                  onChange={e => setBloodGlucose(e.target.value)}
                  min="40" 
                  max="500" 
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Target fasting: 80 - 130 mg/dL</span>
              </div>
            )}

            {/* DYNAMIC: Peak Flow (Shown for Asthma Patients as per Section 12) */}
            {disease === 'Asthma' && (
              <div style={{ background: '#e0f2fe', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                <label className="form-label" style={{ color: '#0369a1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Wind size={14} color="#0284c7" />
                  <span>Peak Flow (L/min) *</span>
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={peakFlow}
                  onChange={e => setPeakFlow(e.target.value)}
                  min="100" 
                  max="800" 
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#0369a1' }}>Target: ~80-100% of baseline</span>
              </div>
            )}

            {/* DYNAMIC: Weight (Shown for Hypertension, Diabetes, CKD, Heart Disease) */}
            {(disease === 'Hypertension' || disease === 'Diabetes' || disease === 'Chronic Kidney Disease' || disease === 'Heart Disease') && (
              <div>
                <label className="form-label">Body Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-input" 
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  min="30" 
                  max="250"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Track rapid fluid shifts</span>
              </div>
            )}

            {/* DYNAMIC: Urine Changes (Shown specifically for CKD as per Section 12) */}
            {disease === 'Chronic Kidney Disease' && (
              <div style={{ gridColumn: '1 / -1', background: '#faf5ff', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e9d5ff' }}>
                <label className="form-label" style={{ color: '#6b21a8', fontWeight: 700 }}>
                  Urine Characteristics &amp; Output Changes (CKD Parameter) *
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Normal volume and pale color; Decreased volume; Foamy; Dark amber"
                  value={urineChanges}
                  onChange={e => setUrineChanges(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Meals and Medication Logs for Diabetes / Relevant */}
            {disease === 'Diabetes' && (
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Meals / Nutritional Intake</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={meals}
                    onChange={e => setMeals(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Medication Adherence</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={medicationStatus}
                    onChange={e => setMedicationStatus(e.target.value)}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* SECTION 2: SUBJECTIVE SYMPTOMS (Section 11 Requirement - NO bracketed text or "extensible level") */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem' }}>
            <Sliders size={20} color="#0f766e" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              2. Subjective Symptoms &amp; Comfort Scales
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            
            {/* Pain Severity Level */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Pain Severity Level</label>
                <span style={{ fontWeight: 800, color: painLevel > 5 ? '#dc2626' : '#0284c7' }}>{painLevel} / 10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={painLevel}
                onChange={e => setPainLevel(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: painLevel > 5 ? '#dc2626' : '#0284c7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                <span>0 (No Pain)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            {/* Fatigue */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Fatigue</label>
                <span style={{ fontWeight: 800, color: fatigueLevel > 6 ? '#d97706' : '#0284c7' }}>{fatigueLevel} / 10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={fatigueLevel}
                onChange={e => setFatigueLevel(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: fatigueLevel > 6 ? '#d97706' : '#0284c7' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                <span>0 (None)</span>
                <span>5 (Moderate)</span>
                <span>10 (Exhausted)</span>
              </div>
            </div>

            {/* Energy Level */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Energy Level</label>
                <span style={{ fontWeight: 800, color: '#16a34a' }}>{energyLevel} / 10</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={energyLevel}
                onChange={e => setEnergyLevel(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#16a34a' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                <span>0 (Very Low)</span>
                <span>5 (Average)</span>
                <span>10 (High Energy)</span>
              </div>
            </div>

          </div>

          {/* Specific Physical Symptoms Toggles */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>
              Check Any Present Physical Symptoms Today:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: cough ? '#fee2e2' : '#ffffff', border: cough ? '1px solid #ef4444' : '1px solid var(--slate-200)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={cough} onChange={e => setCough(e.target.checked)} style={{ accentColor: '#dc2626' }} />
                <span>Cough</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: breathingDifficulty ? '#fee2e2' : '#ffffff', border: breathingDifficulty ? '1px solid #ef4444' : '1px solid var(--slate-200)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={breathingDifficulty} onChange={e => setBreathingDifficulty(e.target.checked)} style={{ accentColor: '#dc2626' }} />
                <span>Breathing difficulty</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: chestDiscomfort ? '#fee2e2' : '#ffffff', border: chestDiscomfort ? '1px solid #ef4444' : '1px solid var(--slate-200)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={chestDiscomfort} onChange={e => setChestDiscomfort(e.target.checked)} style={{ accentColor: '#dc2626' }} />
                <span>Chest discomfort</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: dizziness ? '#fef3c7' : '#ffffff', border: dizziness ? '1px solid #f59e0b' : '1px solid var(--slate-200)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={dizziness} onChange={e => setDizziness(e.target.checked)} style={{ accentColor: '#d97706' }} />
                <span>Dizziness</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: nausea ? '#fef3c7' : '#ffffff', border: nausea ? '1px solid #f59e0b' : '1px solid var(--slate-200)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={nausea} onChange={e => setNausea(e.target.checked)} style={{ accentColor: '#d97706' }} />
                <span>Nausea / vomiting</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: swelling ? '#fef3c7' : '#ffffff', border: swelling ? '1px solid #f59e0b' : '1px solid var(--slate-200)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={swelling} onChange={e => setSwelling(e.target.checked)} style={{ accentColor: '#d97706' }} />
                <span>Swelling / Edema</span>
              </label>

            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Appetite</label>
              <select className="form-select" value={appetite} onChange={e => setAppetite(e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="Poor">Poor / Decreased</option>
                <option value="Increased">Increased</option>
              </select>
            </div>
            <div>
              <label className="form-label">Sleep Quality</label>
              <select className="form-select" value={sleepQuality} onChange={e => setSleepQuality(e.target.value)}>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair / Interrupted</option>
                <option value="Poor">Poor / Insomnia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Other Symptoms or Notes</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Describe any other symptoms or notes for your clinician..."
              value={otherSymptoms}
              onChange={e => setOtherSymptoms(e.target.value)}
            />
          </div>

        </div>

        {/* Submit Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-200)', paddingTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 800 }}
            disabled={submitting}
          >
            <Sparkles size={18} />
            <span>{submitting ? 'Running Clinical AI Evaluation...' : 'Submit Health Check-In & Run AI Analysis'}</span>
          </button>
        </div>

      </form>

      {/* EXPLAINABLE AI RISK PREDICTION MODAL (Sections 13, 14 & 25) */}
      {result && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '640px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-xl)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    AI Risk &amp; Recovery Analysis
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    Post-Acute Telemetry Decision-Support Output
                  </p>
                </div>
              </div>

              <RiskBadge level={result.riskEvaluation?.riskLevel || 'Low Risk'} />
            </div>

            {/* Risk & Trend Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Risk Score</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {result.riskEvaluation?.riskScore || 20} <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>/ 100</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Risk Trend</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingUp size={16} />
                  <span>{result.riskEvaluation?.riskTrend || 'Stable'}</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Recovery Stage</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                  {user?.recoveryStage || 70}%
                </div>
              </div>
            </div>

            {/* Explainable AI: Contributing Factors (Section 13 & 25) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
                Main Contributing Factors (Explainable AI):
              </h4>
              {result.riskEvaluation?.contributingFactors && result.riskEvaluation.contributingFactors.length > 0 ? (
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--slate-700)', lineHeight: 1.6 }}>
                  {result.riskEvaluation.contributingFactors.map((fact, idx) => (
                    <li key={idx}><strong>{fact}</strong></li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#16a34a', background: '#f0fdf4', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  ✓ All vitals and symptoms are currently aligned with your personal recovery baseline.
                </div>
              )}
            </div>

            {/* Personalized Baseline Deviations (Section 9) */}
            {result.baselineDeviations && result.baselineDeviations.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} />
                  <span>Personal Baseline Deviations Detected:</span>
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: '#78350f', lineHeight: 1.5 }}>
                  {result.baselineDeviations.map((dev, idx) => (
                    <li key={idx}>{dev.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Action Recommendation */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: '0.85rem', color: '#0369a1' }}>Recommended Clinical Next Steps:</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                {result.riskEvaluation?.action || 'Continue routine daily biometric logging and maintain prescribed medications.'}
              </p>
            </div>

            {/* Disclaimer & Return */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                Decision-support only &bull; Doctor reviewed
              </span>

              <button 
                type="button" 
                onClick={() => { setResult(null); if (onComplete) onComplete(); }}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem' }}
              >
                <span>Return to Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
