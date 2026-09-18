import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  Calendar,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Radio,
  Edit3,
  FileText,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import MetricCard from "../../components/MetricCard";
import RiskBadge from "../../components/RiskBadge";
import NotificationBanner from "../../components/NotificationBanner";

export default function PatientDashboard({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [monitoringSchedule, setMonitoringSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDoseAction, setActiveDoseAction] = useState(null);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getPatientById(user.id);
      setPatientData(data);
      const scheduleResponse = await api.getMonitoringSchedule(user.id);
      setMonitoringSchedule(scheduleResponse.schedule || null);
    } catch (err) {
      console.error("Error fetching patient dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const handleMedicationAction = async (medId, status) => {
    try {
      await api.logMedicationDose(medId, { status });
      await fetchDashboardData();
      await refreshUser();
    } catch (err) {
      console.error("Failed to log medication:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <Activity
          size={36}
          color="#0284c7"
          style={{ animation: "spin 1.5s linear infinite" }}
        />
        <p style={{ marginTop: "1rem", color: "var(--slate-600)" }}>
          Loading your personalized recovery dashboard...
        </p>
      </div>
    );
  }

  const patient = patientData?.patient || user;
  const latestCheckin = patientData?.latestCheckin;
  const medications = patientData?.medications || [];
  const alerts = patientData?.alerts || [];
  const followups = patientData?.followups || [];
  const nextFollowup = followups.find((f) => f.status === "scheduled");

  // AI Risk assessment values
  const currentRisk = patient?.currentRiskLevel || "Low Risk";
  const riskScore = patient?.riskScore || 15;
  const contributingFactors = latestCheckin?.contributingFactors || [
    "Vitals within target physiological recovery boundaries",
    "Active medication compliance",
    "Incision healing without acute distress",
  ];
  const recommendedAction =
    latestCheckin?.recommendedAction ||
    "Continue standard post-discharge recovery guidelines and log your daily health check-in.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Notification Banner if alerts exist */}
      <NotificationBanner
        alerts={alerts}
        onReview={() => onNavigate("history")}
      />

      {monitoringSchedule && (
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            borderLeft: "4px solid #0f766e",
            background: "#f0fdfa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1rem", color: "#134e4a" }}>
                Today&apos;s Monitoring Schedule
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#0f766e",
                  marginTop: "0.25rem",
                }}
              >
                {monitoringSchedule.daily_summary}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#115e59",
                textTransform: "uppercase",
              }}
            >
              {monitoringSchedule.source === "doctor_override"
                ? "Doctor Reviewed"
                : "AI Suggested"}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "0.6rem",
              marginTop: "0.85rem",
            }}
          >
            {monitoringSchedule.monitoring_plan.map((item, index) => (
              <div
                key={`${item.parameter}-${index}`}
                style={{
                  padding: "0.65rem 0.75rem",
                  background: "#ffffff",
                  border: "1px solid #99f6e4",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    color: "#134e4a",
                  }}
                >
                  {item.parameter}
                </strong>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.72rem",
                    color: "#0f766e",
                    marginTop: "0.2rem",
                  }}
                >
                  {item.time}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.72rem",
                    color: "var(--slate-600)",
                    marginTop: "0.25rem",
                  }}
                >
                  {item.device_required ? "Device required" : item.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Welcome & Recovery Status Header */}
      <div
        className="glass-panel"
        style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, #ffffff, #f0f9ff)",
          border: "1px solid #bae6fd",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
            >
              <h2 style={{ fontSize: "1.6rem", color: "var(--slate-900)" }}>
                {patient.name}
              </h2>
              <span
                style={{
                  fontSize: "0.8rem",
                  background: "var(--slate-100)",
                  color: "var(--slate-600)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                }}
              >
                ID: {patient.id}
              </span>
            </div>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--slate-600)",
                marginTop: "0.25rem",
              }}
            >
              Discharged from <strong>{patient.hospitalName}</strong> on{" "}
              {patient.dischargeDate} &bull; Attending:{" "}
              <strong>{patient.doctorName}</strong>
            </p>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#0369a1",
                marginTop: "0.35rem",
                fontWeight: 500,
              }}
            >
              Primary Diagnosis: <strong>{patient.diagnosis}</strong>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.5rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--slate-500)",
                  fontWeight: 600,
                }}
              >
                Recovery Status:
              </span>
              <span
                style={{
                  fontSize: "0.825rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  fontWeight: 700,
                }}
              >
                {patient.recoveryStatus || "Normal Recovery"}
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--slate-500)",
                  fontWeight: 600,
                }}
              >
                AI Risk Status:
              </span>
              <RiskBadge level={currentRisk} score={riskScore} />
            </div>
          </div>
        </div>
      </div>

      {/* AI-Based Risk Prediction Summary Card */}
      <div
        className="glass-panel"
        style={{
          padding: "1.25rem 1.5rem",
          borderLeft:
            currentRisk === "High Risk"
              ? "5px solid #ef4444"
              : currentRisk === "Moderate Risk"
              ? "5px solid #f59e0b"
              : "5px solid #10b981",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={18} color="#0284c7" />
            <h3 style={{ fontSize: "1rem", color: "var(--slate-900)" }}>
              AI Post-Acute Health Risk Assessment
            </h3>
          </div>
          <RiskBadge level={currentRisk} score={riskScore} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--slate-500)",
                display: "block",
                marginBottom: "0.4rem",
              }}
            >
              Main Contributing Factors
            </span>
            <ul
              style={{
                listStyle: "none",
                paddingLeft: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              {contributingFactors.map((factor, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: "0.825rem",
                    color: "var(--slate-700)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      color:
                        currentRisk === "High Risk"
                          ? "#ef4444"
                          : currentRisk === "Moderate Risk"
                          ? "#f59e0b"
                          : "#10b981",
                      fontWeight: 700,
                    }}
                  >
                    &bull;
                  </span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--slate-500)",
                display: "block",
                marginBottom: "0.4rem",
              }}
            >
              Recommended Clinical Action
            </span>
            <div
              style={{
                padding: "0.75rem 0.9rem",
                background: "var(--slate-50)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--slate-200)",
                fontSize: "0.85rem",
                color: "var(--slate-800)",
                lineHeight: 1.45,
              }}
            >
              {recommendedAction}
            </div>
          </div>
        </div>

        {/* Clear Medical AI Safety Notice */}
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--slate-100)",
            fontSize: "0.725rem",
            color: "var(--slate-500)",
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <ShieldCheck size={14} color="#0284c7" />
          <span>
            Decision Support Notice: This AI assessment is a
            post-hospitalization monitoring tool, not a substitute for
            professional medical care or clinical diagnosis.
          </span>
        </div>
      </div>

      {/* Today's Health Vitals Grid */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.85rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.1rem", color: "var(--slate-900)" }}>
              Today's Latest Health Readings
            </h3>
            <span style={{ fontSize: "0.775rem", color: "var(--slate-500)" }}>
              {latestCheckin
                ? `Last reported: ${new Date(
                    latestCheckin.timestamp
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "No readings submitted today yet."}
            </span>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: "0.45rem 0.95rem", fontSize: "0.825rem" }}
            onClick={() => onNavigate("checkin")}
          >
            <Plus size={15} />
            <span>Complete Daily Check-In</span>
          </button>
        </div>

        <div className="metrics-grid">
          <MetricCard
            title="Heart Rate"
            value={latestCheckin?.heartRate || 74}
            unit="bpm"
            targetRange="60 - 100 bpm"
            status={
              latestCheckin?.heartRate >= 105
                ? "critical"
                : latestCheckin?.heartRate >= 95
                ? "warning"
                : "normal"
            }
            mode={latestCheckin?.measurementMode || "device"}
            trend="+2 bpm"
            trendDirection="up"
          />
          <MetricCard
            title="Oxygen Saturation (SpO2)"
            value={latestCheckin?.spO2 || 97}
            unit="%"
            targetRange="≥ 95%"
            status={
              latestCheckin?.spO2 <= 91
                ? "critical"
                : latestCheckin?.spO2 <= 93
                ? "warning"
                : "normal"
            }
            mode={latestCheckin?.measurementMode || "device"}
            trend={latestCheckin?.spO2 <= 93 ? "-3%" : "Stable"}
            trendDirection={latestCheckin?.spO2 <= 93 ? "down" : "up"}
          />
          <MetricCard
            title="Blood Pressure"
            value={
              latestCheckin
                ? `${latestCheckin.bloodPressureSys}/${latestCheckin.bloodPressureDia}`
                : "120/78"
            }
            unit="mmHg"
            targetRange="90/60 - 130/85"
            status={
              latestCheckin?.bloodPressureSys >= 150
                ? "critical"
                : latestCheckin?.bloodPressureSys >= 135
                ? "warning"
                : "normal"
            }
            mode={latestCheckin?.measurementMode || "manual"}
          />
          <MetricCard
            title="Temperature"
            value={latestCheckin?.temperature || 36.8}
            unit="°C"
            targetRange="36.4 - 37.5 °C"
            status={
              latestCheckin?.temperature >= 38.2
                ? "critical"
                : latestCheckin?.temperature >= 37.8
                ? "warning"
                : "normal"
            }
            mode={latestCheckin?.measurementMode || "manual"}
          />
          <MetricCard
            title="Respiratory Rate"
            value={latestCheckin?.respiratoryRate || 16}
            unit="breaths/min"
            targetRange="12 - 20"
            status={
              latestCheckin?.respiratoryRate >= 23 ? "critical" : "normal"
            }
            mode={latestCheckin?.measurementMode || "device"}
          />
          <MetricCard
            title="Blood Glucose"
            value={latestCheckin?.bloodGlucose || 112}
            unit="mg/dL"
            targetRange="80 - 140 mg/dL"
            status={
              latestCheckin?.bloodGlucose >= 220
                ? "critical"
                : latestCheckin?.bloodGlucose >= 160
                ? "warning"
                : "normal"
            }
            mode={latestCheckin?.measurementMode || "manual"}
          />
        </div>
      </div>

      {/* Two Column Section: Medication Reminders & Next Appointment */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Medication Reminders with Quick Action */}
        <div className="glass-panel" style={{ padding: "1.25rem 1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Pill size={18} color="#8b5cf6" />
              <h3 style={{ fontSize: "1rem", color: "var(--slate-900)" }}>
                Today's Medication Schedule
              </h3>
            </div>
            <button
              onClick={() => onNavigate("medications")}
              style={{
                background: "transparent",
                border: "none",
                color: "#0284c7",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View All &rarr;
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            {medications.slice(0, 3).map((med) => {
              const today = new Date().toISOString().split("T")[0];
              const todayLog = (med.logs || []).find((l) => l.date === today);

              return (
                <div
                  key={med.id}
                  style={{
                    padding: "0.85rem",
                    background: "#f8fafc",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--slate-200)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: "0.925rem",
                          color: "var(--slate-900)",
                        }}
                      >
                        {med.name}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--slate-500)",
                          marginLeft: "0.5rem",
                        }}
                      >
                        {med.dosage}
                      </span>
                    </div>
                    {med.critical && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          background: "#fee2e2",
                          color: "#991b1b",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          fontWeight: 700,
                        }}
                      >
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--slate-600)",
                      marginTop: "0.2rem",
                    }}
                  >
                    {med.frequency} &bull; {med.instructions}
                  </div>

                  {/* Actions: Taken / Missed / Skipped */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "0.65rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid var(--slate-200)",
                    }}
                  >
                    <span
                      style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}
                    >
                      Status:{" "}
                      {todayLog ? (
                        <strong
                          style={{
                            color:
                              todayLog.status === "taken"
                                ? "#059669"
                                : todayLog.status === "missed"
                                ? "#dc2626"
                                : "#d97706",
                            textTransform: "capitalize",
                          }}
                        >
                          {todayLog.status}
                        </strong>
                      ) : (
                        "Pending"
                      )}
                    </span>

                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => handleMedicationAction(med.id, "taken")}
                        style={{
                          padding: "0.25rem 0.55rem",
                          fontSize: "0.725rem",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #10b981",
                          background:
                            todayLog?.status === "taken"
                              ? "#10b981"
                              : "#ecfdf5",
                          color:
                            todayLog?.status === "taken" ? "#fff" : "#065f46",
                          cursor: "pointer",
                        }}
                      >
                        Taken
                      </button>
                      <button
                        onClick={() => handleMedicationAction(med.id, "missed")}
                        style={{
                          padding: "0.25rem 0.55rem",
                          fontSize: "0.725rem",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #ef4444",
                          background:
                            todayLog?.status === "missed"
                              ? "#ef4444"
                              : "#fef2f2",
                          color:
                            todayLog?.status === "missed" ? "#fff" : "#991b1b",
                          cursor: "pointer",
                        }}
                      >
                        Missed
                      </button>
                      <button
                        onClick={() =>
                          handleMedicationAction(med.id, "skipped")
                        }
                        style={{
                          padding: "0.25rem 0.55rem",
                          fontSize: "0.725rem",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #f59e0b",
                          background:
                            todayLog?.status === "skipped"
                              ? "#f59e0b"
                              : "#fffbeb",
                          color:
                            todayLog?.status === "skipped" ? "#fff" : "#92400e",
                          cursor: "pointer",
                        }}
                      >
                        Skipped
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Follow-Up Appointment Countdown */}
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              <Calendar size={18} color="#0284c7" />
              <h3 style={{ fontSize: "1rem", color: "var(--slate-900)" }}>
                Next Clinical Follow-Up
              </h3>
            </div>

            {nextFollowup ? (
              <div
                style={{
                  padding: "1rem",
                  background: "#f0f9ff",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #bae6fd",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    color: "#0369a1",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  Confirmed Appointment
                </span>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0c4a6e",
                    marginTop: "0.25rem",
                  }}
                >
                  {new Date(nextFollowup.date).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    color: "#0369a1",
                    marginTop: "0.25rem",
                  }}
                >
                  <Clock size={14} />
                  <span>
                    {nextFollowup.time} &bull; {nextFollowup.type}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--slate-600)",
                    marginTop: "0.5rem",
                  }}
                >
                  <strong>Doctor:</strong> {nextFollowup.doctorName}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--slate-600)" }}>
                  <strong>Location:</strong> {nextFollowup.clinic}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--slate-500)",
                    marginTop: "0.35rem",
                    fontStyle: "italic",
                  }}
                >
                  {nextFollowup.purpose}
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "var(--radius-md)",
                  color: "var(--slate-600)",
                  fontSize: "0.85rem",
                }}
              >
                No active follow-up scheduled. The care team will schedule your
                appointment based on your recovery trajectory.
              </div>
            )}
          </div>

          <div
            style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}
          >
            <button
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: "0.8rem" }}
              onClick={() => onNavigate("messages")}
            >
              Message Doctor
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, fontSize: "0.8rem" }}
              onClick={() => onNavigate("history")}
            >
              View Trends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
