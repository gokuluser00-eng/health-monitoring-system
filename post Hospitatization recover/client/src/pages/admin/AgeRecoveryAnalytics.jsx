import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Sliders, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export default function AgeRecoveryAnalytics() {
  const [matrixData, setMatrixData] = useState([]);
  const [ageConfig, setAgeConfig] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('middleAged');
  const [cohortAnalytics, setCohortAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Editable config state
  const [editableConfig, setEditableConfig] = useState({
    childrenMax: 17,
    youngAdultsMin: 18,
    youngAdultsMax: 35,
    middleAgedMin: 36,
    middleAgedMax: 55,
    olderAdultsMin: 56,
    olderAdultsMax: 70,
    elderlyMin: 71
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matrixRes, cohortRes] = await Promise.all([
        api.getAgeDiseaseMatrix(),
        api.getAgeWiseAnalytics(selectedAgeGroup)
      ]);
      setMatrixData(matrixRes.matrix || []);
      setAgeConfig(matrixRes.ageConfig);
      setCohortAnalytics(cohortRes);

      if (matrixRes.ageConfig) {
        const c = matrixRes.ageConfig;
        setEditableConfig({
          childrenMax: c.children?.max ?? 17,
          youngAdultsMin: c.youngAdults?.min ?? 18,
          youngAdultsMax: c.youngAdults?.max ?? 35,
          middleAgedMin: c.middleAged?.min ?? 36,
          middleAgedMax: c.middleAged?.max ?? 55,
          olderAdultsMin: c.olderAdults?.min ?? 56,
          olderAdultsMax: c.olderAdults?.max ?? 70,
          elderlyMin: c.elderly?.min ?? 71
        });
      }
    } catch (err) {
      console.error("Error fetching age analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAgeGroup]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setSaveMessage('');
    try {
      const newConfig = {
        children: { id: 'children', name: 'Children / Adolescents', min: 0, max: Number(editableConfig.childrenMax) },
        youngAdults: { id: 'youngAdults', name: 'Young Adults', min: Number(editableConfig.youngAdultsMin), max: Number(editableConfig.youngAdultsMax) },
        middleAged: { id: 'middleAged', name: 'Middle-Aged Adults', min: Number(editableConfig.middleAgedMin), max: Number(editableConfig.middleAgedMax) },
        olderAdults: { id: 'olderAdults', name: 'Older Adults', min: Number(editableConfig.olderAdultsMin), max: Number(editableConfig.olderAdultsMax) },
        elderly: { id: 'elderly', name: 'Elderly', min: Number(editableConfig.elderlyMin), max: 120 }
      };
      await api.updateAgeGroups(newConfig);
      setSaveMessage('Age group boundaries saved and recalculated successfully.');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error updating age boundaries.');
    } finally {
      setSavingConfig(false);
    }
  };

  const diseases = ['Hypertension', 'Diabetes', 'Heart Disease', 'Asthma', 'Chronic Kidney Disease'];
  const ageGroupLabels = [
    { key: 'children', label: 'Children / Adolescents' },
    { key: 'youngAdults', label: 'Young Adults' },
    { key: 'middleAged', label: 'Middle-Aged Adults' },
    { key: 'olderAdults', label: 'Older Adults' },
    { key: 'elderly', label: 'Elderly' }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          <Users size={14} />
          <span>Age-Based Recovery Modeling &bull; Matrix Analytics</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Age &times; Disease Recovery Analytics
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
          Analyze personalized recovery patterns across age cohorts and diseases, configure administrative age thresholds, and examine multi-factorial risk trajectories.
        </p>
      </div>

      {/* SECTION 8: 5x5 AGE GROUP x DISEASE MATRIX TABLE */}
      <div className="card" style={{ padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Age Group &times; Disease Recovery Matrix (Section 8)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Empirical matrix combining Age + Disease + Baseline + Vital Trends + Medication Adherence.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, background: '#f0f9ff', padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid #bae6fd' }}>
            Multi-Factorial Trajectory Engine
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--slate-200)', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem', width: '200px' }}>Age Group</th>
                <th style={{ padding: '0.85rem 1rem' }}>Disease</th>
                <th style={{ padding: '0.85rem 1rem' }}>Active Patients</th>
                <th style={{ padding: '0.85rem 1rem' }}>Average Recovery Stage</th>
                <th style={{ padding: '0.85rem 1rem' }}>Recovery Trend</th>
                <th style={{ padding: '0.85rem 1rem' }}>Risk Trend</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {matrixData.map((cell, idx) => (
                <tr 
                  key={idx} 
                  style={{ 
                    borderBottom: '1px solid var(--slate-200)',
                    background: idx % 2 === 0 ? '#ffffff' : '#fbfcfd'
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {cell.ageGroup}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0284c7' }}>
                    {cell.disease}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                    {cell.patientCount} patients
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, maxWidth: '100px', height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${cell.averageRecoveryStage}%`, height: '100%', background: '#16a34a' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.8rem' }}>
                        {cell.averageRecoveryStage}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: cell.recoveryTrend === 'Closely Monitored' ? '#fef3c7' : '#f0fdf4',
                      color: cell.recoveryTrend === 'Closely Monitored' ? '#b45309' : '#16a34a'
                    }}>
                      {cell.recoveryTrend}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: cell.riskTrend === 'Increasing Alert' ? '#fee2e2' : '#f8fafc',
                      color: cell.riskTrend === 'Increasing Alert' ? '#dc2626' : '#0284c7'
                    }}>
                      {cell.riskTrend}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {cell.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 20: AGE-WISE COHORT ANALYTICS & CONFIGURABLE BOUNDARIES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        
        {/* Cohort Deep-Dive Selector */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#0f766e" />
              <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                Age-Wise Cohort Deep Dive (Section 20)
              </h4>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Select Age Group Cohort:</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {ageGroupLabels.map(ag => (
                <button
                  key={ag.key}
                  type="button"
                  onClick={() => setSelectedAgeGroup(ag.key)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: selectedAgeGroup === ag.key ? '#0f766e' : 'var(--slate-200)',
                    background: selectedAgeGroup === ag.key ? '#0f766e' : '#ffffff',
                    color: selectedAgeGroup === ag.key ? '#ffffff' : 'var(--slate-700)',
                    cursor: 'pointer'
                  }}
                >
                  {ag.label}
                </button>
              ))}
            </div>
          </div>

          {cohortAnalytics && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Patients Enrolled</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>{cohortAnalytics.patientCount}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Average Recovery</span>
                  <strong style={{ fontSize: '1.25rem', color: '#16a34a' }}>{cohortAnalytics.averageRecoveryStage}%</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', display: 'block' }}>Monitoring Days</span>
                  <strong style={{ fontSize: '1.25rem', color: '#0284c7' }}>{cohortAnalytics.averageMonitoringDays} Days</strong>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase' }}>
                  Disease Distribution in this Cohort:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {Object.entries(cohortAnalytics.diseaseDistribution || {}).map(([d, cnt]) => (
                    <span key={d} style={{ background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {d}: <strong>{cnt}</strong>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                <Info size={14} style={{ display: 'inline', marginRight: 4 }} />
                {cohortAnalytics.recoveryTrajectorySummary}
              </div>
            </div>
          )}
        </div>

        {/* Configurable Age Boundaries by Administrator (Section 7) */}
        <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
            <Sliders size={18} color="#0284c7" />
            <h4 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
              Configurable Age Group Boundaries (Section 7)
            </h4>
          </div>

          <form onSubmit={handleSaveConfig}>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
              Healthcare administrators can adjust the age limits. Recalculation applies immediately across all analytics, queues, and AI models.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Group 1: Children / Adolescents (Max Age)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editableConfig.childrenMax}
                  onChange={e => setEditableConfig({ ...editableConfig, childrenMax: e.target.value })}
                  min="5" 
                  max="21"
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Group 2: Young Adults (Min–Max)</label>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editableConfig.youngAdultsMin}
                    onChange={e => setEditableConfig({ ...editableConfig, youngAdultsMin: e.target.value })}
                  />
                  <span>–</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editableConfig.youngAdultsMax}
                    onChange={e => setEditableConfig({ ...editableConfig, youngAdultsMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Group 3: Middle-Aged Adults (Min–Max)</label>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editableConfig.middleAgedMin}
                    onChange={e => setEditableConfig({ ...editableConfig, middleAgedMin: e.target.value })}
                  />
                  <span>–</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editableConfig.middleAgedMax}
                    onChange={e => setEditableConfig({ ...editableConfig, middleAgedMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Group 4: Older Adults (Min–Max)</label>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editableConfig.olderAdultsMin}
                    onChange={e => setEditableConfig({ ...editableConfig, olderAdultsMin: e.target.value })}
                  />
                  <span>–</span>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editableConfig.olderAdultsMax}
                    onChange={e => setEditableConfig({ ...editableConfig, olderAdultsMax: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Group 5: Elderly (Min Age)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editableConfig.elderlyMin}
                  onChange={e => setEditableConfig({ ...editableConfig, elderlyMin: e.target.value })}
                  min="65" 
                  max="90"
                />
              </div>
            </div>

            {saveMessage && (
              <div style={{ padding: '0.5rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', color: '#166534', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                {saveMessage}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem' }}
              disabled={savingConfig}
            >
              <Save size={16} />
              <span>{savingConfig ? 'Saving Boundaries...' : 'Update Age Group Thresholds'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
