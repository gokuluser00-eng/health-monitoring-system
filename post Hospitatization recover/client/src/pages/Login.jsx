import React, { useEffect, useRef, useState } from "react";
import {
  HeartHandshake,
  ShieldCheck,
  User,
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  Hospital,
  FileText,
  Phone,
  Heart,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, googleLogin, register } = useAuth();
  const [activeTab, setActiveTab] = useState("patient_login"); // 'patient_login', 'doctor_login', 'register'

  // Login credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffRole, setStaffRole] = useState("doctor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (activeTab === "register" || !googleClientId || !googleButtonRef.current)
      return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError("");
          setLoading(true);
          try {
            await googleLogin(
              credential,
              activeTab === "doctor_login" ? "doctor" : "patient"
            );
          } catch (err) {
            setError(
              err.message ||
                "This Google account is not registered or authorized."
            );
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 420,
        text: "signin_with",
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [activeTab, googleClientId, googleLogin]);

  // Registration Form
  const [regForm, setRegForm] = useState({
    fullName: "",
    age: "55",
    gender: "Male",
    phone: "+1 (555) 789-0123",
    email: "",
    password: "",
    address: "104 Highland Avenue, Chicago, IL",
    emergencyContactName: "Laura Miller (Daughter)",
    emergencyContactPhone: "+1 (555) 789-0125",
    bloodGroup: "O+",
    existingConditions: "Hypertension, Mild Sleep Apnea",
    allergies: "Penicillin",
    currentMedications: "Amlodipine 5mg, Lisinopril 10mg",
    medicalHistory:
      "No prior major surgeries. Family history of coronary disease.",
    hospitalName: "St. Jude Metropolitan Hospital",
    doctorName: "Dr. Sarah Jenkins, MD",
    admissionDate: new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split("T")[0],
    dischargeDate: new Date(Date.now() - 2 * 86400000)
      .toISOString()
      .split("T")[0],
    hospitalizationReason: "Hypertensive crisis with transient dizziness",
    diagnosis: "Essential Hypertension - Post-Discharge Stabilization",
    dischargeInstructions:
      "Monitor blood pressure twice daily. Low sodium diet. Avoid strenuous exertion.",
    followUpDate: new Date(Date.now() + 5 * 86400000)
      .toISOString()
      .split("T")[0],
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = activeTab === "doctor_login" ? staffRole : "patient";
      await login(email, password, role);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(regForm);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #e0f2fe 100%)",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 2rem auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <div className="brand-icon" style={{ width: 46, height: 46 }}>
            <HeartHandshake size={28} />
          </div>
          <h1 style={{ fontSize: "1.8rem", color: "var(--slate-900)" }}>
            CarePulse AI
          </h1>
        </div>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--slate-600)",
            maxWidth: "650px",
            margin: "0 auto",
          }}
        >
          Post-Hospitalization Monitoring & Risk Prediction Platform
        </p>
        <span style={{ fontSize: "0.8rem", color: "#0369a1", fontWeight: 600 }}>
          Clinical Telemetry &bull; Early Warning Alerts &bull; AI Risk
          Decision-Support
        </span>
      </div>

      <div
        style={{
          maxWidth: activeTab === "register" ? "880px" : "520px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(8px)",
            padding: "0.35rem",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--slate-200)",
            marginBottom: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("patient_login");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "0.65rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              border: "none",
              background:
                activeTab === "patient_login" ? "#ffffff" : "transparent",
              color:
                activeTab === "patient_login" ? "#0284c7" : "var(--slate-600)",
              cursor: "pointer",
              boxShadow:
                activeTab === "patient_login" ? "var(--shadow-sm)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            <User size={15} />
            <span>Patient Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("doctor_login");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "0.65rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              border: "none",
              background:
                activeTab === "doctor_login" ? "#ffffff" : "transparent",
              color:
                activeTab === "doctor_login" ? "#0f766e" : "var(--slate-600)",
              cursor: "pointer",
              boxShadow:
                activeTab === "doctor_login" ? "var(--shadow-sm)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            <Stethoscope size={15} />
            <span>Doctor / Admin Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "0.65rem 0.5rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              border: "none",
              background: activeTab === "register" ? "#ffffff" : "transparent",
              color: activeTab === "register" ? "#7c3aed" : "var(--slate-600)",
              cursor: "pointer",
              boxShadow: activeTab === "register" ? "var(--shadow-sm)" : "none",
            }}
          >
            <span>Register Patient</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "var(--radius-md)",
              color: "#991b1b",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM (Patient or Doctor) */}
        {activeTab !== "register" && (
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                color: "var(--slate-900)",
                marginBottom: "0.25rem",
              }}
            >
              {activeTab === "doctor_login"
                ? "Clinician Portal Sign-In"
                : "Patient Recovery Sign-In"}
            </h2>
            <p
              style={{
                fontSize: "0.825rem",
                color: "var(--slate-500)",
                marginBottom: "1.5rem",
              }}
            >
              {activeTab === "doctor_login"
                ? "Authorized access for attending physicians and post-acute care coordinators."
                : "Enter your registered email or Patient ID and password to access your health dashboard."}
            </p>

            <form onSubmit={handleLoginSubmit}>
              {activeTab === "doctor_login" && (
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select
                    className="form-select"
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">
                  <span>
                    {activeTab === "doctor_login"
                      ? "Provider Email / Doctor ID"
                      : "Patient Email or Patient ID"}
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color="var(--slate-400)"
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: "2.25rem" }}
                    placeholder={
                      activeTab === "doctor_login"
                        ? "e.g. dr.jenkins@stjude-health.org"
                        : "e.g. robert.vance@example.com or PMR-2026-0101"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color="var(--slate-400)"
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "2.25rem" }}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                }}
                disabled={loading}
              >
                <span>{loading ? "Authenticating..." : "Sign In"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {googleClientId && (
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "center",
                }}
                ref={googleButtonRef}
              />
            )}
          </div>
        )}

        {/* REGISTRATION FORM */}
        {activeTab === "register" && (
          <div className="glass-panel" style={{ padding: "2rem" }}>
            <h2
              style={{
                fontSize: "1.35rem",
                color: "var(--slate-900)",
                marginBottom: "0.25rem",
              }}
            >
              Patient Post-Discharge Registration
            </h2>
            <p
              style={{
                fontSize: "0.825rem",
                color: "var(--slate-500)",
                marginBottom: "1.5rem",
              }}
            >
              A unique Patient ID will be automatically generated upon profile
              submission. Only essential recovery and emergency data are
              collected.
            </p>

            <form onSubmit={handleRegisterSubmit}>
              {/* Personal & Emergency Section */}
              <h3
                style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  color: "var(--slate-600)",
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--slate-200)",
                  paddingBottom: "0.4rem",
                  marginBottom: "1rem",
                }}
              >
                1. Personal Information & Emergency Contact
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Full Legal Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.fullName}
                    onChange={(e) =>
                      setRegForm({ ...regForm, fullName: e.target.value })
                    }
                    required
                    placeholder="e.g. Eleanor Vance"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-input"
                    value={regForm.age}
                    onChange={(e) =>
                      setRegForm({ ...regForm, age: e.target.value })
                    }
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={regForm.gender}
                    onChange={(e) =>
                      setRegForm({ ...regForm, gender: e.target.value })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-select"
                    value={regForm.bloodGroup}
                    onChange={(e) =>
                      setRegForm({ ...regForm, bloodGroup: e.target.value })
                    }
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={regForm.phone}
                    onChange={(e) =>
                      setRegForm({ ...regForm, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email Address (Login Username)
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({ ...regForm, email: e.target.value })
                    }
                    required
                    placeholder="user@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={regForm.password}
                    onChange={(e) =>
                      setRegForm({ ...regForm, password: e.target.value })
                    }
                    required
                    placeholder="Create secure password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.address}
                    onChange={(e) =>
                      setRegForm({ ...regForm, address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.emergencyContactName}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        emergencyContactName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={regForm.emergencyContactPhone}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Hospitalization Information */}
              <h3
                style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  color: "var(--slate-600)",
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--slate-200)",
                  paddingBottom: "0.4rem",
                  marginBottom: "1rem",
                }}
              >
                2. Hospitalization & Discharge Records
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Hospital Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.hospitalName}
                    onChange={(e) =>
                      setRegForm({ ...regForm, hospitalName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Attending Doctor Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.doctorName}
                    onChange={(e) =>
                      setRegForm({ ...regForm, doctorName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Date of Hospital Admission
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={regForm.admissionDate}
                    onChange={(e) =>
                      setRegForm({ ...regForm, admissionDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Discharge</label>
                  <input
                    type="date"
                    className="form-input"
                    value={regForm.dischargeDate}
                    onChange={(e) =>
                      setRegForm({ ...regForm, dischargeDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">
                    Reason for Hospitalization
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.hospitalizationReason}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        hospitalizationReason: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Primary Diagnosis</label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.diagnosis}
                    onChange={(e) =>
                      setRegForm({ ...regForm, diagnosis: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Discharge Instructions</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={regForm.dischargeInstructions}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        dischargeInstructions: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Next Scheduled Follow-up Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={regForm.followUpDate}
                    onChange={(e) =>
                      setRegForm({ ...regForm, followUpDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              {/* Medical Conditions & Allergies */}
              <h3
                style={{
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  color: "var(--slate-600)",
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid var(--slate-200)",
                  paddingBottom: "0.4rem",
                  marginBottom: "1rem",
                }}
              >
                3. Clinical Background
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    Existing Medical Conditions (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.existingConditions}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        existingConditions: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Allergies (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.allergies}
                    onChange={(e) =>
                      setRegForm({ ...regForm, allergies: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Current Medications (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.currentMedications}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        currentMedications: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Previous Major Medical/Surgical History
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={regForm.medicalHistory}
                    onChange={(e) =>
                      setRegForm({ ...regForm, medicalHistory: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Consent & Privacy Notice */}
              <div
                style={{
                  padding: "0.85rem",
                  background: "#f8fafc",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--slate-200)",
                  marginBottom: "1.5rem",
                  fontSize: "0.75rem",
                  color: "var(--slate-600)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <ShieldCheck
                  size={18}
                  color="#0284c7"
                  style={{ flexShrink: 0 }}
                />
                <span>
                  <strong>Patient Data Consent Notice:</strong> By registering,
                  you authorize St. Jude Metropolitan Hospital and attending
                  care providers to securely evaluate your daily vitals and
                  symptoms for post-acute risk stratification. Unnecessary
                  sensitive data is never collected or shared.
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTab("patient_login")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "0.75rem 2rem" }}
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? "Creating Profile..."
                      : "Complete Registration & Open Dashboard"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
