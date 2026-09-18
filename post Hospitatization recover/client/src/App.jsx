import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HealthAssistChatbot from './components/HealthAssistChatbot';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DailyCheckIn from './pages/patient/DailyCheckIn';
import HealthHistory from './pages/patient/HealthHistory';
import Medications from './pages/patient/Medications';
import Messages from './pages/patient/Messages';
import Profile from './pages/patient/Profile';

// Admin / Doctor Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DiseaseDatabasesExplorer from './pages/admin/DiseaseDatabasesExplorer';
import AgeRecoveryAnalytics from './pages/admin/AgeRecoveryAnalytics';
import PatientDetailView from './pages/admin/PatientDetailView';
import AlertCenter from './pages/admin/AlertCenter';
import FollowUpManager from './pages/admin/FollowUpManager';
import ThresholdConfig from './pages/admin/ThresholdConfig';

import { Activity } from 'lucide-react';

export default function App() {
  const { user, role, loading } = useAuth();
  
  // Navigation tabs
  const [patientTab, setPatientTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('admin_dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={38} color="#0284c7" style={{ animation: 'spin 1.5s linear infinite' }} />
          <h2 style={{ fontSize: '1.2rem', marginTop: '1rem', color: 'var(--slate-800)' }}>Initializing CarePulse AI Platform...</h2>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Professional Healthcare Landing Page (Section 2)
  if (!user) {
    return <LandingPage />;
  }

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setAdminTab('patient_detail');
  };

  const handleBackToCensus = () => {
    setSelectedPatientId(null);
    setAdminTab('admin_dashboard');
  };

  return (
    <div className="app-layout">
      {/* Dynamic Header / Navbar */}
      <Navbar 
        activeTab={role === 'patient' ? patientTab : adminTab} 
        setActiveTab={role === 'patient' ? setPatientTab : (tab) => {
          setSelectedPatientId(null);
          setAdminTab(tab);
        }} 
      />

      {/* Main Workspace Body */}
      <main className="main-content">
        {role === 'patient' ? (
          <>
            {patientTab === 'dashboard' && <PatientDashboard onNavigate={setPatientTab} />}
            {patientTab === 'checkin' && <DailyCheckIn onComplete={() => setPatientTab('dashboard')} />}
            {patientTab === 'history' && <HealthHistory />}
            {patientTab === 'medications' && <Medications />}
            {patientTab === 'messages' && <Messages />}
            {patientTab === 'profile' && <Profile />}
          </>
        ) : (
          <>
            {adminTab === 'admin_dashboard' && (
              <AdminDashboard 
                onSelectPatient={handleSelectPatient} 
                onNavigate={setAdminTab} 
              />
            )}
            {adminTab === 'disease_databases' && (
              <DiseaseDatabasesExplorer 
                onSelectPatient={handleSelectPatient} 
              />
            )}
            {adminTab === 'age_matrix' && (
              <AgeRecoveryAnalytics />
            )}
            {adminTab === 'patient_detail' && (
              <PatientDetailView 
                patientId={selectedPatientId || 'PMR-HTN-01'} 
                onBack={handleBackToCensus} 
              />
            )}
            {adminTab === 'alerts' && (
              <AlertCenter onSelectPatient={handleSelectPatient} />
            )}
            {adminTab === 'followups' && (
              <FollowUpManager />
            )}
            {adminTab === 'thresholds' && (
              <ThresholdConfig />
            )}
          </>
        )}
      </main>

      {/* HealthAssist AI Chatbot Widget (Section 15) */}
      <HealthAssistChatbot />

      {/* Safety & Clinical Regulatory Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--slate-200)', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong>Post-Hospitalization Monitoring &amp; Risk Prediction Platform</strong> &bull; St. Jude Metropolitan Hospital Health System
          </div>
          <div>
            Clinical Decision Support System (CDSS) &bull; 1,000 Records Synthetic Dataset Prototype &bull; Not a substitute for professional clinical diagnosis.
          </div>
        </div>
      </footer>
    </div>
  );
}
