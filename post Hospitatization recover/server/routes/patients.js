import express from "express";
import { db } from "../services/db.js";
import { canAccessPatient, requirePatientAccess } from "../middleware/auth.js";

const router = express.Router();

// Helper to compute medication adherence percentage
const computeAdherence = (patientId) => {
  const patientMeds = db.data.medications.filter(
    (m) => m.patientId === patientId
  );
  let totalDoses = 0;
  let takenDoses = 0;

  patientMeds.forEach((m) => {
    (m.logs || []).forEach((log) => {
      totalDoses++;
      if (log.status === "taken") takenDoses++;
    });
  });

  if (totalDoses === 0) return 100;
  return Math.round((takenDoses / totalDoses) * 100);
};

// GET /api/patients - List patients with search & advanced filters
router.get("/", (req, res) => {
  const {
    search,
    riskLevel,
    diagnosis,
    ageGroup,
    hasAlerts,
    adherence,
    doctorId,
  } = req.query;

  let visiblePatients = db.data.patients;
  if (req.user.role === "patient") {
    visiblePatients = visiblePatients.filter(
      (patient) => patient.id === req.user.id
    );
  } else if (req.user.role === "doctor") {
    visiblePatients = visiblePatients.filter(
      (patient) => patient.doctorId === req.user.id
    );
  }

  let patients = visiblePatients.map((p) => {
    const pCheckins = db.data.checkins
      .filter((c) => c.patientId === p.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const latestCheckin = pCheckins[0] || null;
    const pAlerts = db.data.alerts.filter(
      (a) => a.patientId === p.id && a.status !== "resolved"
    );
    const adherenceRate = computeAdherence(p.id);

    return {
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      diagnosis: p.diagnosis,
      hospitalName: p.hospitalName,
      doctorName: p.doctorName,
      doctorId: p.doctorId,
      recoveryStatus: p.recoveryStatus,
      currentRiskLevel: p.currentRiskLevel,
      riskScore: p.riskScore || 20,
      lastCheckinDate: latestCheckin ? latestCheckin.timestamp : null,
      latestReadings: latestCheckin
        ? {
            heartRate: latestCheckin.heartRate,
            spO2: latestCheckin.spO2,
            bloodPressure: `${latestCheckin.bloodPressureSys}/${latestCheckin.bloodPressureDia}`,
            temperature: latestCheckin.temperature,
            respiratoryRate: latestCheckin.respiratoryRate,
            measurementMode: latestCheckin.measurementMode,
          }
        : null,
      activeAlertsCount: pAlerts.length,
      highestAlertSeverity: pAlerts.some((a) => a.severity === "critical")
        ? "critical"
        : pAlerts.some((a) => a.severity === "warning")
        ? "warning"
        : pAlerts.length
        ? "informational"
        : "none",
      adherenceRate,
      followUpDate: p.followUpDate,
    };
  });

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q)
    );
  }

  // Risk Level filter
  if (riskLevel && riskLevel !== "All") {
    patients = patients.filter(
      (p) => p.currentRiskLevel.toLowerCase() === riskLevel.toLowerCase()
    );
  }

  // Diagnosis filter
  if (diagnosis && diagnosis !== "All") {
    patients = patients.filter((p) =>
      p.diagnosis.toLowerCase().includes(diagnosis.toLowerCase())
    );
  }

  // Age Group filter
  if (ageGroup) {
    if (ageGroup === "<40") patients = patients.filter((p) => p.age < 40);
    else if (ageGroup === "40-65")
      patients = patients.filter((p) => p.age >= 40 && p.age <= 65);
    else if (ageGroup === "65+") patients = patients.filter((p) => p.age > 65);
  }

  // Alerts filter
  if (hasAlerts === "true") {
    patients = patients.filter((p) => p.activeAlertsCount > 0);
  } else if (hasAlerts === "false") {
    patients = patients.filter((p) => p.activeAlertsCount === 0);
  }

  // Adherence filter
  if (adherence) {
    if (adherence === "low")
      patients = patients.filter((p) => p.adherenceRate < 75);
    else if (adherence === "good")
      patients = patients.filter((p) => p.adherenceRate >= 75);
  }

  // Doctor ID filter
  if (doctorId) {
    patients = patients.filter((p) => p.doctorId === doctorId);
  }

  res.json({
    total: patients.length,
    patients,
  });
});

// GET /api/patients/:id - Complete 360-degree patient profile
router.get(
  "/:id",
  requirePatientAccess((req) => req.params.id),
  (req, res) => {
    const patient = db.data.patients.find((p) => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    const checkins = db.data.checkins
      .filter((c) => c.patientId === patient.id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const medications = db.data.medications.filter(
      (m) => m.patientId === patient.id
    );
    const alerts = db.data.alerts
      .filter((a) => a.patientId === patient.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const followups = db.data.followups
      .filter((f) => f.patientId === patient.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const messages = db.data.messages
      .filter((m) => m.patientId === patient.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Calculate adherence
    let totalDoses = 0;
    let takenDoses = 0;
    let missedDoses = 0;
    let skippedDoses = 0;

    medications.forEach((m) => {
      (m.logs || []).forEach((log) => {
        totalDoses++;
        if (log.status === "taken") takenDoses++;
        else if (log.status === "missed") missedDoses++;
        else if (log.status === "skipped") skippedDoses++;
      });
    });

    const adherenceRate =
      totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    // AI Risk Analysis details
    const latestCheckin = checkins[checkins.length - 1] || null;
    const previousCheckin =
      checkins.length > 1 ? checkins[checkins.length - 2] : null;

    // Build risk trend history
    const riskTrend = checkins.map((c) => ({
      timestamp: c.timestamp,
      riskScore: c.riskScore || 20,
      riskLevel: c.riskLevel || "Low Risk",
      spO2: c.spO2,
      heartRate: c.heartRate,
    }));

    const { password, ...safePatient } = patient;

    res.json({
      patient: safePatient,
      checkins,
      medications,
      adherenceStats: {
        adherenceRate,
        totalDoses,
        takenDoses,
        missedDoses,
        skippedDoses,
      },
      alerts,
      followups,
      messages,
      latestCheckin,
      previousCheckin,
      riskTrend,
    });
  }
);

// PUT /api/patients/:id - Update patient profile
router.put(
  "/:id",
  requirePatientAccess((req) => req.params.id),
  (req, res) => {
    if (req.user.role === "patient" && req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own profile." });
    }

    const index = db.data.patients.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Patient not found." });
    }

    const allowedFields =
      req.user.role === "admin"
        ? Object.keys(req.body)
        : [
            "phone",
            "email",
            "address",
            "emergencyContactName",
            "emergencyContactPhone",
          ];
    const updates = Object.fromEntries(
      allowedFields
        .filter(
          (field) =>
            field !== "password" &&
            field !== "id" &&
            Object.prototype.hasOwnProperty.call(req.body, field)
        )
        .map((field) => [field, req.body[field]])
    );

    db.data.patients[index] = { ...db.data.patients[index], ...updates };
    db.save();

    const { password, ...safePatient } = db.data.patients[index];
    res.json({
      message: "Patient updated successfully.",
      patient: safePatient,
    });
  }
);

export default router;
