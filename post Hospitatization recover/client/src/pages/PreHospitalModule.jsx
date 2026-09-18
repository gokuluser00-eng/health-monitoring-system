import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Heart,
  PhoneCall,
  Stethoscope,
  ArrowRight,
  ArrowLeft,
  Building2,
  UserPlus,
  Clock,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PreHospitalModule({ onBackToLanding }) {
  const { login } = useAuth();

  // Wizard Steps: 1 = Symptom Intake, 2 = Evaluation Result (Emergency or Guidance), 3 = Hospitalization & Discharge Simulation
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    age: "56",
    gender: "Male",
    existingConditions: "Hypertension, Mild Hyperlipidemia",
    currentMedications: "Amlodipine 10mg",
    allergies: "Penicillin",
    symptoms: "Mild shortness of breath on exertion, dry cough for two days",
    startedAgo: "2 days ago",
    worsening: false,
    severity: "Moderate",
  });

  // Checklist of explicit Red Flags (Section 3)
  const redFlagOptions = [
    { id: "chest_pain", label: "Severe / persistent chest discomfort" },
    { id: "severe_dyspnea", label: "Severe breathing difficulty" },
    { id: "unilateral_weakness", label: "Sudden weakness on one side of body" },
    { id: "facial_drooping", label: "Sudden facial drooping" },
    {
      id: "speech_difficulty",
      label: "Sudden difficulty speaking / slurred speech",
    },
    { id: "loss_of_consciousness", label: "Loss of consciousness / fainting" },
    { id: "severe_confusion", label: "Severe confusion / disorientation" },
    { id: "seizure", label: "Seizure or convulsions" },
    {
      id: "thunderclap_headache",
      label: 'Sudden severe "thunderclap" headache',
    },
    {
      id: "significant_deterioration",
      label: "Significant rapid deterioration",
    },
  ];

  const [selectedRedFlags, setSelectedRedFlags] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  // Step 3: Admission & Discharge form
  const [hospitalForm, setHospitalForm] = useState({
    fullName: "David Sterling",
    phone: "+1 (555) 345-6789",
    email: "david.sterling@example.org",
    hospitalName: "St. Jude Metropolitan Hospital",
    doctorName: "Dr. Sarah Jenkins, MD",
    disease: "Hypertension",
    diagnosis: "Essential Hypertension - Post-Discharge Stabilization",
    hospitalizationReason:
      "Symptom evaluation and acute blood pressure control",
  });
  const [enrolling, setEnrolling] = useState(false);
  const [enrolledPatient, setEnrolledPatient] = useState(null);

  const toggleRedFlag = (id) => {
    setSelectedRedFlags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await api.prehospitalTriage({
        ...formData,
        medications: formData.currentMedications,
        selectedRedFlags,
      });
      setTriageResult(res);
      setStep(2);
    } catch (err) {
      alert(err.message || "Error running triage evaluation.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleSimulateAdmission = async (e) => {
    e.preventDefault();
    setEnrolling(true);
    try {
      const res = await api.admitDischargePatient({
        ...hospitalForm,
        age: formData.age,
        gender: formData.gender,
        existingConditions: formData.existingConditions
          .split(",")
          .map((s) => s.trim()),
        allergies: formData.allergies.split(",").map((s) => s.trim()),
        currentMedications: formData.currentMedications
          .split(",")
          .map((s) => s.trim()),
        dischargeInstructions:
          "Monitor vitals twice daily. Adhere strictly to prescribed medications. Low sodium diet.",
      });
      setEnrolledPatient(res.patient);
      // Log in directly because the newly created patient is not in the cached persona list yet.
      await login(res.patient.email, res.patient.password, "patient");
    } catch (err) {
      alert(err.message || "Error enrolling patient into platform.");
      setEnrolling(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #e0f2fe 100%)",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Container */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Top Breadcrumb / Return */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <button
            type="button"
            onClick={onBackToLanding}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Portal Home</span>
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              color: "var(--slate-600)",
            }}
          >
            <span
              style={{
                fontWeight: step === 1 ? 700 : 400,
                color: step === 1 ? "#0284c7" : "inherit",
              }}
            >
              1. Symptom Intake
            </span>
            <span>&rarr;</span>
            <span
              style={{
                fontWeight: step === 2 ? 700 : 400,
                color: step === 2 ? "#0284c7" : "inherit",
              }}
            >
              2. Safety Check &amp; Guidance
            </span>
            <span>&rarr;</span>
            <span
              style={{
                fontWeight: step === 3 ? 700 : 400,
                color: step === 3 ? "#0284c7" : "inherit",
              }}
            >
              3. Hospital Care &amp; Discharge
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#dbeafe",
              color: "#0369a1",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            <Stethoscope size={15} />
            <span>Pre-Hospital Clinical Guidance Module</span>
          </div>
          <h1
            style={{
              fontSize: "1.85rem",
              color: "var(--slate-900)",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}
          >
            New Patient Symptom Evaluation
          </h1>
          <p
            style={{
              color: "var(--slate-600)",
              maxWidth: "620px",
              margin: "0 auto",
              fontSize: "0.95rem",
            }}
          >
            Evaluate pre-hospital warning signs, perform an immediate Emergency
            Red-Flag check, and obtain clinical guidance prior to hospital
            consultation.
          </p>
        </div>

        {/* STEP 1: Symptom Intake & Red Flag Checklist */}
        {step === 1 && (
          <div
            className="card"
            style={{ padding: "2rem", boxShadow: "var(--shadow-lg)" }}
          >
            <form onSubmit={handleTriageSubmit}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid var(--slate-200)",
                  paddingBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    background: "#e0f2fe",
                    color: "#0284c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={20} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--slate-900)",
                    }}
                  >
                    1. Patient Demographics &amp; Health History
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
                    Provide baseline details so our clinical rules engine can
                    analyze symptom context.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label className="form-label">Patient Age *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Non-Binary</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">When Symptoms Started *</label>
                  <select
                    className="form-select"
                    value={formData.startedAgo}
                    onChange={(e) =>
                      setFormData({ ...formData, startedAgo: e.target.value })
                    }
                  >
                    <option value="Within the last few hours">
                      Within the last few hours
                    </option>
                    <option value="1-2 days ago">1-2 days ago</option>
                    <option value="3-5 days ago">3-5 days ago</option>
                    <option value="More than a week ago">
                      More than a week ago
                    </option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Symptom Severity *</label>
                  <select
                    className="form-select"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                  >
                    <option value="Mild">
                      Mild (Noticeable but does not restrict normal activities)
                    </option>
                    <option value="Moderate">
                      Moderate (Interferes with usual tasks)
                    </option>
                    <option value="Severe">
                      Severe (Incapacitating or rapidly escalating)
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label className="form-label">
                    Existing Medical Conditions
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hypertension, Diabetes, Asthma"
                    value={formData.existingConditions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        existingConditions: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label">Current Medications</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Amlodipine 10mg, Metformin 500mg"
                    value={formData.currentMedications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentMedications: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Known Allergies</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Penicillin, Sulfa drugs, Latex, None known"
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData({ ...formData, allergies: e.target.value })
                  }
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Describe Your Symptoms *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Experiencing shortness of breath on exertion, persistent dry cough, slight dizziness when standing..."
                  value={formData.symptoms}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                  background: "#f8fafc",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--slate-200)",
                }}
              >
                <input
                  type="checkbox"
                  id="worseningToggle"
                  checked={formData.worsening}
                  onChange={(e) =>
                    setFormData({ ...formData, worsening: e.target.checked })
                  }
                  style={{ width: 18, height: 18, accentColor: "#dc2626" }}
                />
                <label
                  htmlFor="worseningToggle"
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--slate-800)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Symptoms are progressively worsening or accelerating in
                  frequency
                </label>
              </div>

              {/* EMERGENCY RED-FLAG CHECK (Section 3 Requirement) */}
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <ShieldAlert size={20} color="#b91c1c" />
                  <h4
                    style={{
                      color: "#991b1b",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    Emergency Red-Flag Screening
                  </h4>
                </div>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#7f1d1d",
                    marginBottom: "1rem",
                    lineHeight: 1.4,
                  }}
                >
                  Please check any of the following acute symptoms if currently
                  experienced. If any are present, the system immediately
                  prioritizes emergency guidance.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "0.65rem",
                  }}
                >
                  {redFlagOptions.map((flag) => (
                    <label
                      key={flag.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        background: selectedRedFlags.includes(flag.id)
                          ? "#fee2e2"
                          : "#ffffff",
                        border: selectedRedFlags.includes(flag.id)
                          ? "1px solid #ef4444"
                          : "1px solid #fca5a5",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: selectedRedFlags.includes(flag.id)
                          ? 700
                          : 500,
                        color: "#991b1b",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRedFlags.includes(flag.id)}
                        onChange={() => toggleRedFlag(flag.id)}
                        style={{ accentColor: "#dc2626" }}
                      />
                      <span>{flag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Submit */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: "0.75rem 1.75rem",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                  }}
                  disabled={evaluating}
                >
                  {evaluating
                    ? "Running Clinical Screening..."
                    : "Evaluate Symptoms & Check Red Flags"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Evaluation Results (Emergency Red Flag vs Symptom Guidance) */}
        {step === 2 && triageResult && (
          <div>
            {triageResult.isEmergency ? (
              /* EMERGENCY RED FLAG DISPLAY (Section 3) */
              <div
                className="card"
                style={{
                  padding: "2.5rem",
                  border: "2px solid #ef4444",
                  background: "#fff5f5",
                  boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: "#fee2e2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#dc2626",
                    }}
                  >
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        color: "#dc2626",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      CRITICAL EMERGENCY ALERT
                    </span>
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "#991b1b",
                      }}
                    >
                      Potential Emergency Warning Signs Detected
                    </h2>
                  </div>
                </div>

                <div
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  “Potential emergency warning signs detected. Please seek
                  immediate medical attention.”
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      color: "#991b1b",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Triggered Warning Signs:
                  </h4>
                  <ul
                    style={{
                      paddingLeft: "1.25rem",
                      color: "#7f1d1d",
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {triageResult.detectedFlags.map((df, idx) => (
                      <li key={idx}>
                        <strong>{df}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    background: "#ffffff",
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #fecaca",
                    marginBottom: "2rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      color: "var(--slate-900)",
                      fontWeight: 700,
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <PhoneCall size={18} color="#dc2626" />
                    <span>Immediate Action Protocol</span>
                  </h4>
                  <ul
                    style={{
                      paddingLeft: "1.25rem",
                      color: "var(--slate-700)",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {triageResult.actionPlan.map((stepItem, idx) => (
                      <li key={idx}>{stepItem}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                  >
                    <ArrowLeft size={16} />
                    <span>Re-evaluate Symptoms</span>
                  </button>

                  <a
                    href="tel:911"
                    className="btn btn-emergency"
                    style={{
                      padding: "0.75rem 2rem",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      textDecoration: "none",
                    }}
                  >
                    <PhoneCall size={20} />
                    <span>Call 911 Emergency Dispatch</span>
                  </a>
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--slate-500)",
                  }}
                >
                  {triageResult.disclaimer}
                </div>
              </div>
            ) : (
              /* PRE-HOSPITAL SYMPTOM GUIDANCE (Section 4) */
              <div
                className="card"
                style={{ padding: "2rem", boxShadow: "var(--shadow-lg)" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    borderBottom: "1px solid var(--slate-200)",
                    paddingBottom: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "#dcfce7",
                      color: "#16a34a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#16a34a",
                        textTransform: "uppercase",
                      }}
                    >
                      Safety Check Passed &bull; No Immediate Red Flag Detected
                    </span>
                    <h2
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: "var(--slate-900)",
                      }}
                    >
                      Possible Symptom Categories
                    </h2>
                  </div>
                </div>

                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "1rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    color: "#166534",
                    fontSize: "0.85rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <strong>Non-Diagnostic Guidance:</strong>{" "}
                  {triageResult.message}
                </div>

                {/* Categorized Symptom Clusters */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  {triageResult.categories.map((cat, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--slate-200)",
                        borderRadius: "var(--radius-md)",
                        padding: "1.25rem",
                        borderLeft: "4px solid #0284c7",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#0369a1",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {cat.category}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--slate-800)",
                          marginBottom: "0.75rem",
                          lineHeight: 1.5,
                          fontWeight: 500,
                        }}
                      >
                        “{cat.guidance}”
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "0.75rem",
                          background: "#f8fafc",
                          padding: "0.75rem 1rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--slate-700)" }}>
                            Recommended Timeframe:
                          </strong>
                          <div style={{ color: "#0284c7", fontWeight: 600 }}>
                            {cat.recommendedTimeframe}
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: "var(--slate-700)" }}>
                            Clinical Advice:
                          </strong>
                          <div style={{ color: "var(--slate-600)" }}>
                            {cat.precautions}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Journey Progression to Hospitalization & Discharge */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
                    border: "1px solid #bfdbfe",
                    borderRadius: "var(--radius-md)",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <Building2 size={20} color="#0284c7" />
                    <h4
                      style={{
                        fontWeight: 800,
                        color: "#1e40af",
                        fontSize: "1rem",
                      }}
                    >
                      Healthcare Journey Progression
                    </h4>
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--slate-700)",
                      marginBottom: "1rem",
                      lineHeight: 1.5,
                    }}
                  >
                    After receiving medical evaluation and completing necessary
                    hospitalization, patients transition to post-acute recovery.
                    You can now simulate this transition to create the official
                    Patient Profile and initiate continuous post-hospitalization
                    monitoring.
                  </p>

                  <div
                    style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                  >
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="btn btn-primary"
                      style={{ padding: "0.75rem 1.5rem", fontWeight: 700 }}
                    >
                      <UserPlus size={18} />
                      <span>
                        Proceed to Hospital Evaluation &amp; Discharge Setup
                      </span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn btn-secondary"
                    >
                      <ArrowLeft size={16} />
                      <span>Adjust Symptom Inputs</span>
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "var(--slate-500)",
                  }}
                >
                  {triageResult.disclaimer}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Medical Evaluation, Hospitalization & Discharge Simulation */}
        {step === 3 && (
          <div
            className="card"
            style={{ padding: "2rem", boxShadow: "var(--shadow-lg)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--slate-200)",
                paddingBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Building2 size={22} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "var(--slate-900)",
                  }}
                >
                  3. Inpatient Stay &amp; Discharge Profile Creation
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>
                  Complete the healthcare continuum: Medical Evaluation &rarr;
                  Hospitalization &rarr; Discharge &rarr; Post-Acute Monitoring.
                </p>
              </div>
            </div>

            <form onSubmit={handleSimulateAdmission}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label className="form-label">Full Patient Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalForm.fullName}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalForm.phone}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        phone: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={hospitalForm.email}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label className="form-label">
                    Discharge Disease Category *
                  </label>
                  <select
                    className="form-select"
                    value={hospitalForm.disease}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        disease: e.target.value,
                        diagnosis: `${e.target.value} - Post-Stabilization Stabilization`,
                      })
                    }
                  >
                    <option value="Hypertension">Hypertension</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Heart Disease">Heart Disease</option>
                    <option value="Asthma">Asthma</option>
                    <option value="Chronic Kidney Disease">
                      Chronic Kidney Disease
                    </option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Admitting Hospital *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalForm.hospitalName}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        hospitalName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label className="form-label">Attending Physician *</label>
                  <select
                    className="form-select"
                    value={hospitalForm.doctorName}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        doctorName: e.target.value,
                      })
                    }
                  >
                    <option value="Dr. Sarah Jenkins, MD">
                      Dr. Sarah Jenkins, MD (Cardiology &amp; Post-Acute)
                    </option>
                    <option value="Dr. Alex Rivera, MD">
                      Dr. Alex Rivera, MD (Pulmonology &amp; Critical Care)
                    </option>
                    <option value="Dr. Rachel Chen, MD">
                      Dr. Rachel Chen, MD (Endocrinology)
                    </option>
                    <option value="Dr. Marcus Sterling, MD">
                      Dr. Marcus Sterling, MD (Nephrology)
                    </option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Discharge Diagnosis *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hospitalForm.diagnosis}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        diagnosis: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label className="form-label">
                  Reason for Hospitalization *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={hospitalForm.hospitalizationReason}
                  onChange={(e) =>
                    setHospitalForm({
                      ...hospitalForm,
                      hospitalizationReason: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--slate-200)",
                  paddingTop: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-secondary"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Symptom Guidance</span>
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: "0.75rem 2rem", fontWeight: 800 }}
                  disabled={enrolling}
                >
                  <FileCheck size={18} />
                  <span>
                    {enrolling
                      ? "Creating Patient Profile..."
                      : "Complete Discharge & Start Monitoring"}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
