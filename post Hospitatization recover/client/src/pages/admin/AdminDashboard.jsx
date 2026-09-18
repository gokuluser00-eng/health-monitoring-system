import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Pill, 
  Search, 
  Filter, 
  ChevronRight, 
  Radio, 
  Edit3, 
  Bell, 
  UserCheck, 
  RefreshCw,
  Hospital
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RiskBadge from '../../components/RiskBadge';

export default function AdminDashboard({ onSelectPatient, onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [diagnosisFilter, setDiagnosisFilter] = useState('All');
  const [ageGroupFilter, setAgeGroupFilter] = useState('');
  const [alertsFilter, setAlertsFilter] = useState('');
  const [adherenceFilter, setAdherenceFilter] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, patientsRes] = await Promise.all([
        api.getStats(),
        api.getPatients({
          search,
          riskLevel: riskFilter,
          diagnosis: diagnosisFilter,
          ageGroup: ageGroupFilter,
          hasAlerts: alertsFilter,
          adherence: adherenceFilter
        })
      ]);
      setStats(statsRes);
      setPatients(patientsRes.patients || []);
    } catch (err) {
      console.error("Error loading admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, riskFilter, diagnosisFilter, ageGroupFilter, alertsFilter, adherenceFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Clinician Profile Overview Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'MD'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>{user.name}</h2>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user.id} &bull; {user.role?.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {user.department || 'Cardiology & Acute Recovery Unit'} &bull; <strong>{user.hospital || 'St. Jude Metropolitan Hospital'}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}
              onClick={() => onNavigate('alerts')}
            >
              <Bell size={14} />
              <span>Review Alert Center</span>
            </button>
            <button 
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={fetchDashboardData}
              title="Refresh patient census"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      {/* KPI Stats Overview Cards (Section 18: 8 Cards) */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
        
        {/* Card 1: Total Patients */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="metric-header">Total Patients</div>
          <div className="metric-number">{stats?.totalPatients || patients.length}</div>
          <div className="metric-footer" style={{ color: 'var(--slate-500)' }}>100+ Enrolled</div>
        </div>

        {/* Card 2: New Patients */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="metric-header">New Patients</div>
          <div className="metric-number" style={{ color: '#2563eb' }}>{Math.max(12, Math.round((stats?.totalPatients || 108) * 0.15))}</div>
          <div className="metric-footer" style={{ color: '#2563eb' }}>Last 48 Hours</div>
        </div>

        {/* Card 3: Active Monitoring */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="metric-header" style={{ color: '#065f46' }}>Active Monitoring</div>
          <div className="metric-number" style={{ color: '#059669' }}>{(stats?.totalPatients || patients.length) - (stats?.highRiskCount || 0)}</div>
          <div className="metric-footer" style={{ color: '#059669' }}>Continuous Telemetry</div>
        </div>

        {/* Card 4: Patients Requiring Review */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="metric-header" style={{ color: '#92400e' }}>Requiring Review</div>
          <div className="metric-number" style={{ color: '#d97706' }}>{stats?.highRiskCount || 18}</div>
          <div className="metric-footer" style={{ color: '#d97706' }}>Clinical Attention</div>
        </div>

        {/* Card 5: Critical Alerts */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #dc2626', background: stats?.criticalAlertsCount > 0 ? '#fef2f2' : undefined }}>
          <div className="metric-header" style={{ color: '#991b1b' }}>Critical Alerts</div>
          <div className="metric-number" style={{ color: '#dc2626' }}>{stats?.criticalAlertsCount || 6}</div>
          <div className="metric-footer" style={{ color: '#dc2626', fontWeight: 700 }}>Immediate Triage</div>
        </div>

        {/* Card 6: Missed Follow-ups */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="metric-header">Missed Follow-ups</div>
          <div className="metric-number" style={{ color: '#7c3aed' }}>{stats?.missedFollowupsCount || 4}</div>
          <div className="metric-footer">Reschedule Needed</div>
        </div>

        {/* Card 7: Monitoring Gaps (Section 24) */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #64748b' }}>
          <div className="metric-header">Monitoring Gaps</div>
          <div className="metric-number" style={{ color: '#475569' }}>8</div>
          <div className="metric-footer">&gt;36h No Check-In</div>
        </div>

        {/* Card 8: Medication Adherence Issues (Section 22) */}
        <div className="glass-panel metric-card" style={{ borderLeft: '4px solid #ea580c' }}>
          <div className="metric-header">Med Adherence Issues</div>
          <div className="metric-number" style={{ color: '#c2410c' }}>{stats?.adherenceIssuesCount || 11}</div>
          <div className="metric-footer">&lt;75% Regimen Compliance</div>
        </div>

      </div>

      {/* Quick Jump Bar to Disease Databases & Age Analytics */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('disease_databases')}
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.85rem 1rem', background: '#ffffff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>5 Disease Databases Explorer &bull; 1,000 Records</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Hypertension, Diabetes, Heart Disease, Asthma, CKD &bull; Excel Export</div>
            </div>
          </div>
          <ChevronRight size={18} color="#0284c7" />
        </button>

        <button
          onClick={() => onNavigate('age_matrix')}
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.85rem 1rem', background: '#ffffff', border: '1px solid #ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-lg)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#f0fdfa', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>Age &times; Disease Matrix Analytics</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>5&times;5 Cohort Recovery Matrix &bull; Configurable Age Limits</div>
            </div>
          </div>
          <ChevronRight size={18} color="#0f766e" />
        </button>
      </div>

      {/* Smart Patient Queue Section (Section 17) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        
        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#0284c7" />
              Patient Monitoring Roster ({patients.length})
            </h3>

            {/* Quick Search */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
                placeholder="Search patient name, ID, or diagnosis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Multi-facet Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--slate-600)' }}>
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            {/* Risk Filter */}
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="High Risk">High Risk Only</option>
              <option value="Moderate Risk">Moderate Risk Only</option>
              <option value="Low Risk">Low Risk Only</option>
            </select>

            {/* Diagnosis Filter */}
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={diagnosisFilter}
              onChange={(e) => setDiagnosisFilter(e.target.value)}
            >
              <option value="All">All Diagnoses</option>
              <option value="CABG">CABG / Cardiac</option>
              <option value="Heart Failure">Heart Failure</option>
              <option value="Pneumonia">Pneumonia</option>
              <option value="Cholecystectomy">Cholecystectomy</option>
              <option value="DKA">Diabetes / DKA</option>
              <option value="Sepsis">Urosepsis</option>
              <option value="Arthroplasty">Total Knee / Ortho</option>
            </select>

            {/* Age Filter */}
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={ageGroupFilter}
              onChange={(e) => setAgeGroupFilter(e.target.value)}
            >
              <option value="">All Ages</option>
              <option value="<40">&lt; 40 yrs</option>
              <option value="40-65">40 - 65 yrs</option>
              <option value="65+">65+ yrs (Senior)</option>
            </select>

            {/* Alert Status Filter */}
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={alertsFilter}
              onChange={(e) => setAlertsFilter(e.target.value)}
            >
              <option value="">All Alert States</option>
              <option value="true">Has Active Alerts</option>
              <option value="false">No Active Alerts</option>
            </select>

            {/* Adherence Filter */}
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
              value={adherenceFilter}
              onChange={(e) => setAdherenceFilter(e.target.value)}
            >
              <option value="">All Adherence</option>
              <option value="low">Suboptimal (&lt; 75%)</option>
              <option value="good">Good (≥ 75%)</option>
            </select>

            {/* Reset Filter Button */}
            {(riskFilter !== 'All' || diagnosisFilter !== 'All' || ageGroupFilter || alertsFilter || adherenceFilter || search) && (
              <button
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', marginLeft: 'auto' }}
                onClick={() => {
                  setSearch('');
                  setRiskFilter('All');
                  setDiagnosisFilter('All');
                  setAgeGroupFilter('');
                  setAlertsFilter('');
                  setAdherenceFilter('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Patient Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Activity size={32} color="#0284c7" style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
            No patients match the selected filter criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Name & ID</th>
                  <th>Age / Sex</th>
                  <th>Discharge Diagnosis</th>
                  <th>Current Risk Level</th>
                  <th>Latest Readings (Device vs Manual)</th>
                  <th>Med Adherence</th>
                  <th>Alert Status</th>
                  <th>Follow-up</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr 
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectPatient(p.id)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{p.name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{p.id}</span>
                    </td>
                    <td>
                      {p.age}y &bull; {p.gender[0]}
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }} title={p.diagnosis}>
                        {p.diagnosis}
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={p.currentRiskLevel} score={p.riskScore} size="sm" />
                    </td>
                    <td>
                      {p.latestReadings ? (
                        <div style={{ fontSize: '0.775rem' }}>
                          <div>
                            SpO2: <strong style={{ color: p.latestReadings.spO2 <= 92 ? '#dc2626' : '#0284c7' }}>{p.latestReadings.spO2}%</strong> &bull; HR: <strong>{p.latestReadings.heartRate} bpm</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                            <span>BP: {p.latestReadings.bloodPressure}</span>
                            {p.latestReadings.measurementMode === 'device' ? (
                              <span style={{ fontSize: '0.65rem', color: '#166534', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>BLE Device</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: '#475569', background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>Manual</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>No telemetry yet</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '40px', height: '6px', background: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.adherenceRate}%`, height: '100%', background: p.adherenceRate >= 80 ? '#10b981' : p.adherenceRate >= 60 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: p.adherenceRate < 75 ? '#dc2626' : 'var(--slate-700)' }}>
                          {p.adherenceRate}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {p.activeAlertsCount > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          background: p.highestAlertSeverity === 'critical' ? '#fee2e2' : '#fef3c7',
                          color: p.highestAlertSeverity === 'critical' ? '#991b1b' : '#92400e'
                        }}>
                          <ShieldAlert size={12} />
                          <span>{p.activeAlertsCount} Alert{p.activeAlertsCount > 1 ? 's' : ''}</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={13} />
                          <span>Clear</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        {p.followUpDate || '--'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(p.id);
                        }}
                      >
                        <span>Profile 360°</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
