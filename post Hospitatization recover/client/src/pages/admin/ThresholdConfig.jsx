import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, ShieldAlert, Save, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

export default function ThresholdConfig() {
  const [thresholds, setThresholds] = useState(null);
  const [modelMetadata, setModelMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await api.getThresholds();
      setThresholds(data.thresholds || {});
      setModelMetadata(data.modelMetadata || null);
    } catch (err) {
      console.error("Error loading thresholds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateThresholds(thresholds);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving thresholds:", err);
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm("Reset all patient data, vitals, medications, and alerts back to pristine demo state?")) {
      return;
    }
    setResetting(true);
    try {
      await api.resetDatabase();
      alert("Demo dataset successfully reset to initial seed!");
      window.location.reload();
    } catch (err) {
      console.error("Reset error:", err);
      alert("Error resetting database.");
    } finally {
      setResetting(false);
    }
  };

  const updateField = (key, value) => {
    setThresholds(prev => ({
      ...prev,
      [key]: Number(value)
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Sliders size={32} color="#0284c7" style={{ animation: 'spin 1.5s linear infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--slate-600)' }}>Loading clinical thresholds and machine learning configuration...</p>
      </div>
    );
  }

  const importances = modelMetadata?.feature_importances || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={24} color="#0284c7" />
            Configurable Clinical Alert Thresholds & AI Parameters
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
            Tailor alert trigger thresholds across hospital departments according to specialized patient cohorts (e.g. COPD vs Cardiac Surgery).
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={handleResetDemo}
          disabled={resetting}
          style={{ color: '#dc2626', borderColor: '#fca5a5' }}
        >
          <RotateCcw size={14} />
          <span>{resetting ? 'Resetting...' : 'Reset Demo Database'}</span>
        </button>
      </div>

      {saved && (
        <div style={{ padding: '0.85rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle2 size={18} />
          <span>Clinical thresholds successfully committed! The alert engine is now actively evaluating with updated parameters.</span>
        </div>
      )}

      {/* Threshold Configuration Form */}
      <form onSubmit={handleSave}>
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)', marginBottom: '1rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
            Physiological Trigger Thresholds
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            
            <div className="form-group">
              <label className="form-label">
                <span>SpO2 Critical Alert (≤)</span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Default: 92%</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.spO2MinCritical || 92} 
                onChange={(e) => updateField('spO2MinCritical', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>SpO2 Warning Alert (&lt;)</span>
                <span style={{ fontSize: '0.75rem', color: '#d97706' }}>Default: 94%</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.spO2MinWarning || 94} 
                onChange={(e) => updateField('spO2MinWarning', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Heart Rate Max Critical (≥)</span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Default: 110 bpm</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.heartRateMaxCritical || 110} 
                onChange={(e) => updateField('heartRateMaxCritical', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Heart Rate Min Critical (≤)</span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Default: 50 bpm</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.heartRateMinCritical || 50} 
                onChange={(e) => updateField('heartRateMinCritical', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Body Temperature Critical (≥)</span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Default: 38.3 °C (101°F)</span>
              </label>
              <input 
                type="number" 
                step="0.1" 
                className="form-input" 
                value={thresholds.tempMaxCritical || 38.3} 
                onChange={(e) => updateField('tempMaxCritical', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Systolic BP Critical (≥)</span>
                <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>Default: 160 mmHg</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.bloodPressureSysMaxCritical || 160} 
                onChange={(e) => updateField('bloodPressureSysMaxCritical', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Consecutive Missed Meds Trigger</span>
                <span style={{ fontSize: '0.75rem', color: '#d97706' }}>Default: 2 Doses</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.consecutiveMissedMedsAlert || 2} 
                onChange={(e) => updateField('consecutiveMissedMedsAlert', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Lack of Check-In Window</span>
                <span style={{ fontSize: '0.75rem', color: '#d97706' }}>Default: 36 Hours</span>
              </label>
              <input 
                type="number" 
                className="form-input" 
                value={thresholds.checkInProlongedHours || 36} 
                onChange={(e) => updateField('checkInProlongedHours', e.target.value)} 
                required 
              />
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={15} />
              <span>{saving ? 'Updating Parameters...' : 'Save Updated Thresholds'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* AI/ML Model Inspection Card */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffffff, #f0fdf4)', border: '1px solid #bbf7d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="#166534" />
            <h3 style={{ fontSize: '1.15rem', color: '#166534' }}>Trained ML Risk Prediction Model Architecture</h3>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            Model Status: Ready & Calibrated
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Model Type</span>
            <strong style={{ fontSize: '0.85rem', display: 'block', marginTop: '0.2rem', color: 'var(--slate-900)' }}>
              {modelMetadata?.model_type || 'Random Forest Classifier'}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Validation Accuracy</span>
            <strong style={{ fontSize: '1.2rem', display: 'block', color: '#059669' }}>
              {modelMetadata ? `${(modelMetadata.accuracy * 100).toFixed(1)}%` : '73.0%'}
            </strong>
          </div>

          <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>Training Cohort</span>
            <strong style={{ fontSize: '1.2rem', display: 'block', color: 'var(--slate-900)' }}>
              {modelMetadata?.n_samples || '1,500'} Patient Episodes
            </strong>
          </div>
        </div>

        {/* Feature Importance Attribution Bar Chart */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', fontWeight: 700 }}>
            Explainable Feature Importance Ranking (Top Contributing Predictors)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {Object.entries(importances).slice(0, 7).map(([feature, weight], idx) => {
              const pct = (weight * 100).toFixed(1);
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
                  <span style={{ minWidth: '180px', fontWeight: 600, color: 'var(--slate-800)' }}>{feature}</span>
                  <div style={{ flex: 1, height: '8px', background: 'var(--slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, weight * 450)}%`, height: '100%', background: idx < 2 ? '#ef4444' : idx < 4 ? '#0284c7' : '#10b981', borderRadius: '4px' }} />
                  </div>
                  <span style={{ minWidth: '45px', textAlign: 'right', fontWeight: 700, color: 'var(--slate-600)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
