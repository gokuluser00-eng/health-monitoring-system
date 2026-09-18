import React, { useState } from "react";
import {
  HeartHandshake,
  UserPlus,
  User,
  Stethoscope,
  ShieldAlert,
  Activity,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronRight,
  Database,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PreHospitalModule from "./PreHospitalModule";

export default function LandingPage() {
  const { login } = useAuth();

  // Mode: 'landing', 'prehospital', 'patient_login', 'doctor_login'
  const [activeView, setActiveView] = useState("landing");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e, role) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, role);
    } catch (err) {
      setError(
        err.message ||
          "Login failed. Please check your credentials or use the quick demo selector."
      );
    } finally {
      setLoading(false);
    }
  };

  if (activeView === "prehospital") {
    return (
      <PreHospitalModule onBackToLanding={() => setActiveView("landing")} />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 40%, #eff6ff 100%)",
      }}
    >
      {/* Top Professional Healthcare Header */}
      <header
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--slate-200)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0.85rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
            }}
            onClick={() => setActiveView("landing")}
          >
            <div className="brand-icon" style={{ width: 42, height: 42 }}>
              <HeartHandshake size={24} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.25rem",
                  color: "var(--slate-900)",
                  lineHeight: 1.1,
                }}
              >
                CarePulse AI
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "#0369a1",
                  fontWeight: 600,
                }}
              >
                Post-Hospitalization Continuous Monitoring
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <button
              className={`btn ${
                activeView === "prehospital" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setActiveView("prehospital")}
              style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
            >
              <UserPlus size={15} />
              <span>New Patient</span>
            </button>
            <button
              className={`btn ${
                activeView === "patient_login" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => {
                setActiveView("patient_login");
                setError("");
              }}
              style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
            >
              <User size={15} />
              <span>Patient Login</span>
            </button>
            <button
              className={`btn ${
                activeView === "doctor_login" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => {
                setActiveView("doctor_login");
                setError("");
              }}
              style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
            >
              <Stethoscope size={15} />
              <span>Admin / Doctor Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main
        style={{
          flex: 1,
          padding: "2.5rem 1.5rem",
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* HERO SECTION */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "880px",
            margin: "0 auto 3rem auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#e0f2fe",
              color: "#0369a1",
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              fontSize: "0.82rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
            }}
          >
            <Sparkles size={16} />
            <span>
              Continuous Healthcare Intelligence &bull; Pre-Hospital to Recovery
            </span>
          </div>

          {/* Section 2 Title */}
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              color: "var(--slate-900)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: "1.25rem",
            }}
          >
            Post-Hospitalization Monitoring &amp; Risk Prediction Platform
          </h1>

          {/* Section 2 Subtitle */}
          <p
            style={{
              fontSize: "1.25rem",
              color: "#0369a1",
              fontWeight: 600,
              maxWidth: "780px",
              margin: "0 auto 1.5rem auto",
              lineHeight: 1.5,
            }}
          >
            “From first symptoms to recovery — continuous monitoring,
            personalized risk prediction and timely healthcare support.”
          </p>

          {/* Section 2 Required Regulatory Disclaimer */}
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1.25rem",
              color: "#92400e",
              fontSize: "0.85rem",
              fontWeight: 600,
              maxWidth: "760px",
              margin: "0 auto 2.5rem auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <ShieldAlert size={18} color="#d97706" />
            <span>
              “This platform provides monitoring and decision-support
              information. It does not provide a medical diagnosis or replace
              professional medical care.”
            </span>
          </div>

          {/* THREE MAJOR OPTIONS (Section 2 Requirement) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              textAlign: "left",
            }}
          >
            {/* OPTION 1: New Patient */}
            <div
              className="card"
              onClick={() => setActiveView("prehospital")}
              style={{
                padding: "2rem",
                border: "2px solid #38bdf8",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                background: "#ffffff",
                boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <UserPlus size={26} />
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#0284c7",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                Option 1 &bull; Pre-Hospital
              </div>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--slate-900)",
                  marginBottom: "0.5rem",
                }}
              >
                New Patient
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--slate-600)",
                  lineHeight: 1.5,
                  marginBottom: "1.25rem",
                }}
              >
                Experiencing symptoms before visiting a hospital? Complete our
                automated Emergency Red-Flag screening and receive guided
                symptom categorization.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#0284c7",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                <span>Start Symptom Guidance</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* OPTION 2: Existing Patient Login */}
            <div
              className="card"
              onClick={() => {
                setActiveView("patient_login");
                setError("");
              }}
              style={{
                padding: "2rem",
                border:
                  activeView === "patient_login"
                    ? "2px solid #0284c7"
                    : "1px solid var(--slate-200)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                background: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "#f0fdf4",
                  color: "#16a34a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <User size={26} />
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#16a34a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                Option 2 &bull; Post-Discharge
              </div>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--slate-900)",
                  marginBottom: "0.5rem",
                }}
              >
                Existing Patient Login
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--slate-600)",
                  lineHeight: 1.5,
                  marginBottom: "1.25rem",
                }}
              >
                Access your post-hospitalization recovery portal:
                disease-specific daily check-in, personalized baseline tracking,
                medications, and HealthAssist AI.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#16a34a",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                <span>Sign In to Recovery Portal</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* OPTION 3: Admin / Doctor Login */}
            <div
              className="card"
              onClick={() => {
                setActiveView("doctor_login");
                setError("");
              }}
              style={{
                padding: "2rem",
                border:
                  activeView === "doctor_login"
                    ? "2px solid #0f766e"
                    : "1px solid var(--slate-200)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                background: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "#f0fdfa",
                  color: "#0f766e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <Stethoscope size={26} />
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "#0f766e",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                Option 3 &bull; Clinical Triage
              </div>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--slate-900)",
                  marginBottom: "0.5rem",
                }}
              >
                Admin / Doctor Login
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--slate-600)",
                  lineHeight: 1.5,
                  marginBottom: "1.25rem",
                }}
              >
                Clinical Command Center: Smart Patient Queue, 5 Disease
                Databases Explorer, Age &times; Disease matrix analytics, and
                alert triage.
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  color: "#0f766e",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                <span>Access Clinical Command Center</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN DRAWER / SECTION IF ACTIVE */}
        {(activeView === "patient_login" || activeView === "doctor_login") && (
          <div style={{ maxWidth: "560px", margin: "0 auto 3rem auto" }}>
            <div
              className="card"
              style={{
                padding: "2rem",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--slate-300)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid var(--slate-200)",
                  paddingBottom: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--slate-900)",
                    }}
                  >
                    {activeView === "patient_login"
                      ? "Existing Patient Portal"
                      : "Healthcare Professional Login"}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
                    Enter credentials or use 1-click Demo Profiles below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("landing")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--slate-400)",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                  }}
                >
                  &times;
                </button>
              </div>

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
                  }}
                >
                  {error}
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={(e) =>
                  handleLoginSubmit(
                    e,
                    activeView === "doctor_login" ? "doctor" : "patient"
                  )
                }
              >
                <div style={{ marginBottom: "1rem" }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={16}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        color: "var(--slate-400)",
                      }}
                    />
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: "2.4rem" }}
                      placeholder={
                        activeView === "doctor_login"
                          ? "dr.jenkins@hospital.org"
                          : "patient@example.com"
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={16}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 12,
                        color: "var(--slate-400)",
                      }}
                    />
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: "2.4rem" }}
                      placeholder="••••••••"
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
                    padding: "0.75rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                  disabled={loading}
                >
                  {loading
                    ? "Authenticating..."
                    : `Sign In as ${
                        activeView === "doctor_login" ? "Clinician" : "Patient"
                      }`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* HEALTHCARE CONTINUUM JOURNEY MAP (Section 1 Requirement) */}
        <div
          className="card"
          style={{
            padding: "2rem",
            marginBottom: "3rem",
            background: "#ffffff",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--slate-900)",
                marginBottom: "0.35rem",
              }}
            >
              Complete End-to-End Healthcare Journey
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--slate-500)" }}>
              How our platform supports continuous care from first symptoms
              through hospital discharge to full recovery.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "0.5rem",
              textAlign: "center",
            }}
          >
            {[
              { title: "New Patient", step: "1" },
              { title: "Pre-Hospital Guidance", step: "2" },
              { title: "Emergency Red-Flag", step: "3" },
              { title: "Medical Evaluation", step: "4" },
              { title: "Hospitalization", step: "5" },
              { title: "Discharge", step: "6" },
              { title: "Patient Profile", step: "7" },
              { title: "Disease Telemetry", step: "8" },
              { title: "Personal Baseline", step: "9" },
              { title: "AI Risk Prediction", step: "10" },
              { title: "Intelligent Alerts", step: "11" },
              { title: "Recovery Tracking", step: "12" },
            ].map((st, i) => (
              <div
                key={i}
                style={{
                  padding: "0.75rem 0.5rem",
                  background: "#f8fafc",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--slate-200)",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#0284c7",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 0.4rem auto",
                  }}
                >
                  {st.step}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--slate-800)",
                    lineHeight: 1.2,
                  }}
                >
                  {st.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Safety & CDSS Regulatory Footer */}
      <footer
        style={{
          background: "#ffffff",
          borderTop: "1px solid var(--slate-200)",
          padding: "1.5rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--slate-500)",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div>
            <strong>
              Post-Hospitalization Monitoring &amp; Risk Prediction Platform
            </strong>{" "}
            &bull; St. Jude Metropolitan Health System
          </div>
          <div>
            Clinical Decision Support System (CDSS) &bull; Synthetic Demo
            Dataset (1,000 Records)
          </div>
        </div>
      </footer>
    </div>
  );
}
