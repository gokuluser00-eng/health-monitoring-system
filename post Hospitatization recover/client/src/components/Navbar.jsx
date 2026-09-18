import React, { useState } from "react";
import {
  HeartHandshake,
  Activity,
  ClipboardCheck,
  History,
  Pill,
  MessageSquare,
  User,
  ShieldAlert,
  Bell,
  Users,
  Calendar,
  Sliders,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import EmergencyModal from "./EmergencyModal";

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, role, logout } = useAuth();
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <div
            className="brand-wrapper"
            onClick={() =>
              setActiveTab(role === "patient" ? "dashboard" : "admin_dashboard")
            }
            style={{ cursor: "pointer" }}
          >
            <div className="brand-icon">
              <HeartHandshake size={24} />
            </div>
            <div className="brand-text">
              <h1>CarePulse AI</h1>
              <span>Post-Hospitalization Risk Platform</span>
            </div>
          </div>

          {/* Role Navigation Links */}
          <nav className="nav-links">
            {role === "patient" ? (
              <>
                <button
                  className={`nav-btn ${
                    activeTab === "dashboard" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <Activity size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "checkin" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("checkin")}
                >
                  <ClipboardCheck size={16} />
                  <span>Daily Check-In</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <History size={16} />
                  <span>Health History</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "medications" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("medications")}
                >
                  <Pill size={16} />
                  <span>Medications</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "messages" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("messages")}
                >
                  <MessageSquare size={16} />
                  <span>Care Team</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "profile" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  <User size={16} />
                  <span>Discharge Profile</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className={`nav-btn ${
                    activeTab === "admin_dashboard" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("admin_dashboard")}
                >
                  <Users size={16} />
                  <span>Patient Command Center</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "disease_databases" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("disease_databases")}
                >
                  <Activity size={16} />
                  <span>5 Disease Databases</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "age_matrix" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("age_matrix")}
                >
                  <Users size={16} />
                  <span>Age &times; Disease Matrix</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "alerts" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("alerts")}
                >
                  <Bell size={16} />
                  <span>Alert Center</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "followups" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("followups")}
                >
                  <Calendar size={16} />
                  <span>Follow-Up Manager</span>
                </button>
                <button
                  className={`nav-btn ${
                    activeTab === "thresholds" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("thresholds")}
                >
                  <Sliders size={16} />
                  <span>Clinical Thresholds & AI</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Tools: Emergency SOS + Logout */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
          >
            {/* Emergency SOS Button for Patient */}
            {role === "patient" && (
              <button
                className="btn btn-emergency"
                onClick={() => setEmergencyOpen(true)}
                title="Immediate emergency contact and care team alert"
              >
                <ShieldAlert size={16} />
                <span>Emergency SOS</span>
              </button>
            )}

            {/* Logout */}
            <button
              className="btn btn-secondary"
              style={{
                padding: "0.45rem 0.65rem",
                border: "1px solid var(--slate-300)",
              }}
              onClick={logout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Emergency Assistance Dialog */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        patient={user}
      />
    </>
  );
}
