import React, { useState, useEffect } from "react";
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ChevronRight,
  User,
  RefreshCw,
  Activity,
} from "lucide-react";
import { api } from "../../services/api";

export default function AlertCenter({ onSelectPatient }) {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [actioningAlert, setActioningAlert] = useState(null);
  const [targetStatus, setTargetStatus] = useState("acknowledged");
  const [actionNotes, setActionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts({
        status: statusFilter,
        severity: severityFilter,
      });
      setAlerts(data.alerts || []);
      setCounts(data.counts || null);
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleExecuteStatusUpdate = async (e) => {
    e.preventDefault();
    if (!actioningAlert) return;
    setSaving(true);
    try {
      await api.updateAlertStatus(actioningAlert.id, {
        status: targetStatus,
        notes: actionNotes,
      });
      setActioningAlert(null);
      setActionNotes("");
      await fetchAlerts();
    } catch (err) {
      console.error("Failed to update alert:", err);
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadge = (sev) => {
    if (sev === "critical") {
      return (
        <span
          style={{
            fontSize: "0.725rem",
            fontWeight: 800,
            textTransform: "uppercase",
            padding: "0.2rem 0.6rem",
            borderRadius: "var(--radius-full)",
            background: "#ef4444",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <ShieldAlert size={12} /> CRITICAL
        </span>
      );
    }
    if (sev === "warning") {
      return (
        <span
          style={{
            fontSize: "0.725rem",
            fontWeight: 800,
            textTransform: "uppercase",
            padding: "0.2rem 0.6rem",
            borderRadius: "var(--radius-full)",
            background: "#f59e0b",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <AlertTriangle size={12} /> WARNING
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: "0.725rem",
          fontWeight: 700,
          textTransform: "uppercase",
          padding: "0.2rem 0.6rem",
          borderRadius: "var(--radius-full)",
          background: "#3b82f6",
          color: "#fff",
        }}
      >
        INFO
      </span>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Masthead */}
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
          <h2
            style={{
              fontSize: "1.4rem",
              color: "var(--slate-900)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Bell size={24} color="#ef4444" />
            Clinical Early Warning Alert Command Center
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--slate-600)",
              marginTop: "0.2rem",
            }}
          >
            Real-time threshold triggers, physiological decompensation warnings,
            and medication adherence lapses across all monitored patients.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchAlerts}
          style={{ padding: "0.45rem 0.85rem", fontSize: "0.8rem" }}
        >
          <RefreshCw size={14} />
          <span>Refresh Feeds</span>
        </button>
      </div>

      {/* KPI Count Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={() => setStatusFilter("new")}
          className="glass-panel"
          style={{
            padding: "0.85rem",
            border: statusFilter === "new" ? "2px solid #ef4444" : undefined,
            background: counts?.new > 0 ? "#fef2f2" : undefined,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--slate-500)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            New Alerts
          </span>
          <div
            style={{ fontSize: "1.6rem", fontWeight: 800, color: "#dc2626" }}
          >
            {counts?.new || 0}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("acknowledged")}
          className="glass-panel"
          style={{
            padding: "0.85rem",
            border:
              statusFilter === "acknowledged" ? "2px solid #0284c7" : undefined,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--slate-500)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Acknowledged
          </span>
          <div
            style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0369a1" }}
          >
            {counts?.acknowledged || 0}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("under_review")}
          className="glass-panel"
          style={{
            padding: "0.85rem",
            border:
              statusFilter === "under_review" ? "2px solid #8b5cf6" : undefined,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--slate-500)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Under Review
          </span>
          <div
            style={{ fontSize: "1.6rem", fontWeight: 800, color: "#7c3aed" }}
          >
            {counts?.under_review || 0}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("resolved")}
          className="glass-panel"
          style={{
            padding: "0.85rem",
            border:
              statusFilter === "resolved" ? "2px solid #10b981" : undefined,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--slate-500)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Resolved
          </span>
          <div
            style={{ fontSize: "1.6rem", fontWeight: 800, color: "#059669" }}
          >
            {counts?.resolved || 0}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("all")}
          className="glass-panel"
          style={{
            padding: "0.85rem",
            border:
              statusFilter === "all" ? "2px solid var(--slate-700)" : undefined,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--slate-500)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            All Events
          </span>
          <div
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--slate-800)",
            }}
          >
            {counts?.total || 0}
          </div>
        </button>
      </div>

      {/* Severity Filter Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--slate-600)",
          }}
        >
          Filter Severity:
        </span>
        {["all", "critical", "warning", "informational"].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            style={{
              padding: "0.3rem 0.75rem",
              fontSize: "0.775rem",
              fontWeight: 600,
              borderRadius: "var(--radius-full)",
              border:
                severityFilter === sev
                  ? "1px solid var(--slate-800)"
                  : "1px solid var(--slate-300)",
              background:
                severityFilter === sev ? "var(--slate-800)" : "#ffffff",
              color: severityFilter === sev ? "#ffffff" : "var(--slate-700)",
              cursor: "pointer",
            }}
          >
            {sev.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Alert Feed Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <Activity
            size={32}
            color="#ef4444"
            style={{ animation: "spin 1.5s linear infinite" }}
          />
        </div>
      ) : alerts.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--slate-500)",
          }}
        >
          No alerts found matching the current filter.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {alerts.map((a) => {
            const isCritical = a.severity === "critical";
            const isResolved = a.status === "resolved";

            return (
              <div
                key={a.id}
                className="glass-panel"
                style={{
                  padding: "1.25rem 1.5rem",
                  borderLeft: isResolved
                    ? "5px solid #10b981"
                    : isCritical
                    ? "5px solid #ef4444"
                    : "5px solid #f59e0b",
                  background: isResolved
                    ? "#fcfdfd"
                    : isCritical
                    ? "linear-gradient(135deg, #ffffff, #fffafb)"
                    : "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {getSeverityBadge(a.severity)}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "#f1f5f9",
                          color: "var(--slate-600)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {a.id}
                      </span>
                      <strong
                        style={{
                          fontSize: "1.1rem",
                          color: "#0284c7",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => onSelectPatient(a.patientId)}
                        title="Click to view full 360 profile"
                      >
                        {a.patientName} ({a.patientId})
                      </strong>
                    </div>

                    <div
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--slate-900)",
                        marginTop: "0.4rem",
                      }}
                    >
                      {a.type} &mdash;{" "}
                      <span
                        style={{ color: isCritical ? "#dc2626" : "#d97706" }}
                      >
                        {a.triggeringParameter}
                      </span>
                    </div>

                    {/* Values & Baseline */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1.25rem",
                        marginTop: "0.4rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div>
                        Current:{" "}
                        <strong style={{ color: "#dc2626" }}>
                          {a.currentValue}
                        </strong>
                      </div>
                      <div>
                        Baseline/Prior:{" "}
                        <span style={{ color: "var(--slate-600)" }}>
                          {a.previousValue}
                        </span>
                      </div>
                      <div style={{ color: "var(--slate-400)" }}>
                        Timestamp: {new Date(a.timestamp).toLocaleString()}
                      </div>
                    </div>

                    {/* Trend & Reason */}
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--slate-700)",
                        marginTop: "0.4rem",
                      }}
                    >
                      {a.trendSummary}
                    </p>

                    {/* Clinical Action Recommendation */}
                    <div
                      style={{
                        marginTop: "0.6rem",
                        padding: "0.5rem 0.75rem",
                        background: "#f0f9ff",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid #bae6fd",
                        fontSize: "0.825rem",
                        color: "#0369a1",
                      }}
                    >
                      <strong>Protocol Action:</strong> {a.recommendedAction}
                    </div>

                    {a.notes && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#059669",
                          marginTop: "0.4rem",
                          fontWeight: 500,
                        }}
                      >
                        &bull; Review Log: {a.notes}
                      </div>
                    )}
                  </div>

                  {/* Right Control Column */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--slate-500)",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        Status:
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                          background: isResolved
                            ? "#ecfdf5"
                            : a.status === "under_review"
                            ? "#eff6ff"
                            : a.status === "acknowledged"
                            ? "#fef3c7"
                            : "#fee2e2",
                          color: isResolved
                            ? "#065f46"
                            : a.status === "under_review"
                            ? "#1e40af"
                            : a.status === "acknowledged"
                            ? "#92400e"
                            : "#991b1b",
                          textTransform: "capitalize",
                        }}
                      >
                        {a.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.75rem",
                        }}
                        onClick={() => onSelectPatient(a.patientId)}
                      >
                        <User size={13} />
                        <span>Patient Dossier</span>
                      </button>

                      {!isResolved && (
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.75rem",
                          }}
                          onClick={() => {
                            setActioningAlert(a);
                            setTargetStatus(
                              a.status === "new" ? "acknowledged" : "resolved"
                            );
                          }}
                        >
                          <span>Manage Alert</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog */}
      {actioningAlert && (
        <div className="modal-overlay" onClick={() => setActioningAlert(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>
                Triage Alert: {actioningAlert.id}
              </h3>
            </div>
            <form onSubmit={handleExecuteStatusUpdate}>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <p style={{ fontSize: "0.85rem", color: "var(--slate-700)" }}>
                  Patient: <strong>{actioningAlert.patientName}</strong> &bull;
                  Trigger: <strong>{actioningAlert.triggeringParameter}</strong>{" "}
                  ({actioningAlert.currentValue})
                </p>

                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-select"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                  >
                    <option value="acknowledged">
                      Acknowledged (Seen by Physician)
                    </option>
                    <option value="under_review">
                      Under Review (Diagnostics / Triage In Progress)
                    </option>
                    <option value="resolved">
                      Resolved (Clinical Intervention Complete)
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Clinical Action / Resolution Notes
                  </label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Enter physician notes e.g., 'Contacted patient, advised dose increase, oxygen levels stabilized to 95% at 2h check.'"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActioningAlert(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Commit Status Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
