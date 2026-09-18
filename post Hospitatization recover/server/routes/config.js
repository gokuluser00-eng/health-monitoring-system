import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../services/db.js";
import { requireRole } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACTS_FILE = path.join(
  __dirname,
  "../ai_engine/model_artifacts.json"
);

const router = express.Router();

// GET /api/config/thresholds
router.get("/thresholds", (req, res) => {
  let modelMetadata = null;
  if (fs.existsSync(ARTIFACTS_FILE)) {
    try {
      modelMetadata = JSON.parse(fs.readFileSync(ARTIFACTS_FILE, "utf-8"));
    } catch (e) {
      console.error("Could not parse model artifacts:", e);
    }
  }

  res.json({
    thresholds: db.data.thresholds,
    modelMetadata,
  });
});

// PUT /api/config/thresholds
router.put("/thresholds", requireRole("admin"), (req, res) => {
  db.data.thresholds = {
    ...db.data.thresholds,
    ...req.body,
  };
  db.save();

  res.json({
    message: "Thresholds updated successfully.",
    thresholds: db.data.thresholds,
  });
});

// GET /api/config/stats - Global Dashboard Overview KPIs
router.get("/stats", (req, res) => {
  const patients = (db.data.patients || []).filter((patient) =>
    req.user.role === "doctor" ? patient.doctorId === req.user.id : true
  );
  const visiblePatientIds = new Set(patients.map((patient) => patient.id));
  const alerts = (db.data.alerts || []).filter((alert) =>
    visiblePatientIds.has(alert.patientId)
  );
  const followups = (db.data.followups || []).filter((followup) =>
    visiblePatientIds.has(followup.patientId)
  );

  const totalPatients = patients.length;
  const underMonitoring = patients.length; // all registered in post-acute care
  const lowRiskCount = patients.filter(
    (p) => p.currentRiskLevel === "Low Risk"
  ).length;
  const moderateRiskCount = patients.filter(
    (p) => p.currentRiskLevel === "Moderate Risk"
  ).length;
  const highRiskCount = patients.filter(
    (p) => p.currentRiskLevel === "High Risk"
  ).length;

  const newAlertsCount = alerts.filter((a) => a.status === "new").length;
  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === "critical" && a.status !== "resolved"
  ).length;
  const missedFollowupsCount = followups.filter(
    (f) => f.status === "missed"
  ).length;

  // Medication adherence flags (patients with < 75% adherence)
  let adherenceIssuesCount = 0;
  patients.forEach((p) => {
    const meds = db.data.medications.filter((m) => m.patientId === p.id);
    let totalDoses = 0;
    let takenDoses = 0;
    meds.forEach((m) => {
      (m.logs || []).forEach((l) => {
        totalDoses++;
        if (l.status === "taken") takenDoses++;
      });
    });
    if (totalDoses > 0 && takenDoses / totalDoses < 0.75) {
      adherenceIssuesCount++;
    }
  });

  res.json({
    totalPatients,
    underMonitoring,
    lowRiskCount,
    moderateRiskCount,
    highRiskCount,
    newAlertsCount,
    criticalAlertsCount,
    missedFollowupsCount,
    adherenceIssuesCount,
  });
});

// POST /api/config/reset - Reset demo database to pristine seed
router.post("/reset", requireRole("admin"), (req, res) => {
  const freshData = db.resetToSeed();
  res.json({
    message: "Database successfully reset to pristine demo seed state.",
    count: freshData.patients.length,
  });
});

export default router;
