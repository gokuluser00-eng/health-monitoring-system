import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Heart, 
  Activity, 
  Wind, 
  Droplet, 
  CheckCircle2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import RiskBadge from '../../components/RiskBadge';

export default function DiseaseDatabasesExplorer({ onSelectPatient }) {
  // Tabs: 'raw1000', 'hypertension', 'diabetes', 'heart_disease', 'asthma', 'ckd'
  const [activeTab, setActiveTab] = useState('raw1000');
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch summary initially
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.getDiseasesSummary();
        setSummary(res);
      } catch (err) {
        console.error("Error fetching disease summary:", err);
      }
    };
    fetchSummary();
  }, []);

  // Fetch data when activeTab, page, or search changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'raw1000') {
          res = await api.getRaw1000Records({ page, limit: 20, search });
        } else {
          res = await api.getDiseaseDb(activeTab, { page, limit: 20, search });
        }
        setRecords(res.records || []);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.total || 0);
      } catch (err) {
        console.error("Error fetching database records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, page, search]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
  };

  const handleExportCSV = (target) => {
    window.open(`/api/diseases/export-csv/${target}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Database size={14} />
            <span>Disease-Specific Databases &bull; 1,000 Records Telemetry</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Disease Databases &amp; Dataset Explorer
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem' }}>
            Explore the 5 separate disease-specific clinical registries and download the 1,000 synthetic patient-day dataset.
          </p>
        </div>

        {/* Download CSV Action */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleExportCSV(activeTab === 'raw1000' ? 'all' : activeTab)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
          >
            <Download size={16} />
            <span>Export {activeTab === 'raw1000' ? 'All 1,000 Records' : activeTab.toUpperCase()} to Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Database Summary KPI Cards (Section 5 Requirement) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          { id: 'hypertension', label: 'Hypertension DB', count: 200, icon: Activity, color: '#dc2626', bg: '#fef2f2', params: 'BP, HR, Weight, Meals, SpO2' },
          { id: 'diabetes', label: 'Diabetes DB', count: 200, icon: Droplet, color: '#b45309', bg: '#fef3c7', params: 'Glucose, BP, HR, Meals, Weight' },
          { id: 'heart_disease', label: 'Heart Disease DB', count: 200, icon: Heart, color: '#e11d48', bg: '#ffe4e6', params: 'BP, HR, Weight, SpO2, Meds' },
          { id: 'asthma', label: 'Asthma DB', count: 200, icon: Wind, color: '#0284c7', bg: '#e0f2fe', params: 'SpO2, Peak Flow, HR, Cough, BP' },
          { id: 'ckd', label: 'Chronic Kidney DB', count: 200, icon: Database, color: '#7c3aed', bg: '#ede9fe', params: 'BP, Weight, Urine, HR, SpO2' }
        ].map(dbInfo => {
          const Icon = dbInfo.icon;
          const isSelected = activeTab === dbInfo.id;
          return (
            <div 
              key={dbInfo.id}
              onClick={() => handleTabSwitch(dbInfo.id)}
              className="card"
              style={{ 
                padding: '1.25rem', 
                border: isSelected ? `2px solid ${dbInfo.color}` : '1px solid var(--slate-200)',
                cursor: 'pointer',
                background: isSelected ? '#ffffff' : '#f8fafc',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: dbInfo.bg, color: dbInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {dbInfo.count}
                </span>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                {dbInfo.label}
              </h4>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                {dbInfo.params}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
            {[
              { key: 'raw1000', label: 'All 1,000 Records (Excel Structure)' },
              { key: 'hypertension', label: 'Database 1: Hypertension' },
              { key: 'diabetes', label: 'Database 2: Diabetes' },
              { key: 'heart_disease', label: 'Database 3: Heart Disease' },
              { key: 'asthma', label: 'Database 4: Asthma' },
              { key: 'ckd', label: 'Database 5: Chronic Kidney' }
            ].map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabSwitch(t.key)}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === t.key ? '#0284c7' : 'transparent',
                  color: activeTab === t.key ? '#ffffff' : 'var(--slate-600)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, color: 'var(--slate-400)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem', padding: '0.45rem 2.2rem' }}
              placeholder="Search by ID, name, symptoms..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

        </div>

        {/* Total Records Counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          <div>
            Showing <strong>{records.length}</strong> of <strong>{totalRecords}</strong> records &bull; Page {page} of {totalPages}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Auto-mapped to clinical database architecture</span>
          </div>
        </div>

        {/* Interactive Data Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem auto' }} />
              <div>Loading database records...</div>
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
              No records found matching your filter criteria.
            </div>
          ) : (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--slate-200)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Patient ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Patient Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Age / Sex</th>
                  {activeTab === 'raw1000' && <th style={{ padding: '0.75rem 1rem' }}>Disease</th>}
                  <th style={{ padding: '0.75rem 1rem' }}>Day / Date</th>
                  
                  {/* Disease-Specific Column Headers (Section 5) */}
                  {activeTab === 'diabetes' && <th style={{ padding: '0.75rem 1rem' }}>Blood Glucose</th>}
                  <th style={{ padding: '0.75rem 1rem' }}>Blood Pressure</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Heart Rate</th>
                  {activeTab === 'asthma' && <th style={{ padding: '0.75rem 1rem' }}>Peak Flow</th>}
                  {activeTab === 'ckd' && <th style={{ padding: '0.75rem 1rem' }}>Urine Changes</th>}
                  {activeTab !== 'asthma' && <th style={{ padding: '0.75rem 1rem' }}>Weight</th>}
                  <th style={{ padding: '0.75rem 1rem' }}>SpO2</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Reported Symptoms</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Medication Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => {
                  const pId = r.Patient_ID || r.patientId;
                  const pName = r.Patient_Name || r.patientName;
                  const age = r.Age || r.age;
                  const sex = r.Sex || r.sex;
                  const day = r.Report_Day || r.reportDay;
                  const date = r.Date || r.date;
                  const bp = r.Blood_Pressure || r.bloodPressure;
                  const hr = r.Heart_Rate_bpm || r.heartRate;
                  const spo2 = r.SpO2_percent || r.spO2;
                  const symp = r.Symptoms || r.symptoms;
                  const med = r.Medication || r.medication;
                  const glucose = r.Blood_Glucose_mg_dL || r.bloodGlucose;
                  const pf = r.Peak_Flow_L_min || r.peakFlow;
                  const wt = r.Weight_kg || r.weight;
                  const urine = r.Urine_Changes || r.urineChanges;
                  const riskStatus = r.riskStatus;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: '#0284c7' }}>
                        {pId}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: 'var(--slate-900)' }}>
                        {pName}
                      </td>
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--slate-600)' }}>
                        {age} &bull; {sex}
                      </td>
                      {activeTab === 'raw1000' && (
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{r.Disease}</span>
                        </td>
                      )}
                      <td style={{ padding: '0.65rem 1rem', color: 'var(--slate-600)', whiteSpace: 'nowrap' }}>
                        Day {day} ({date})
                      </td>

                      {/* Disease Specific Columns */}
                      {activeTab === 'diabetes' && (
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: glucose > 180 ? '#dc2626' : 'var(--slate-900)' }}>
                          {glucose ? `${glucose} mg/dL` : '—'}
                        </td>
                      )}

                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600 }}>
                        {bp}
                      </td>

                      <td style={{ padding: '0.65rem 1rem', color: hr > 100 ? '#dc2626' : 'var(--slate-700)' }}>
                        {hr} bpm
                      </td>

                      {activeTab === 'asthma' && (
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: pf < 350 ? '#dc2626' : '#0284c7' }}>
                          {pf ? `${pf} L/min` : '—'}
                        </td>
                      )}

                      {activeTab === 'ckd' && (
                        <td style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', maxWidth: '180px', color: 'var(--slate-700)' }}>
                          {urine || 'Normal'}
                        </td>
                      )}

                      {activeTab !== 'asthma' && (
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--slate-700)' }}>
                          {wt ? `${wt} kg` : '—'}
                        </td>
                      )}

                      <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: spo2 < 93 ? '#dc2626' : (spo2 < 95 ? '#d97706' : '#16a34a') }}>
                        {spo2}%
                      </td>

                      <td style={{ padding: '0.65rem 1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--slate-600)' }} title={symp}>
                        {symp}
                      </td>

                      <td style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: med?.includes('Missed') ? '#dc2626' : 'var(--slate-600)' }}>
                        {med}
                      </td>

                      <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                        {riskStatus ? (
                          <RiskBadge level={riskStatus} />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectPatient && onSelectPatient(pId)}
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            View Patient
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
          <button 
            type="button" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>

          <button 
            type="button" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
}
