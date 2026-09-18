import express from "express";
import { db } from "../services/db.js";
import { checkMedicationAlerts } from "../services/alertEngine.js";
import { canAccessPatient, findPatient } from "../middleware/auth.js";

const router = express.Router();

// GET /api/medications/:patientId
router.get("/:patientId", (req, res) => {
  const patientId = req.params.patientId;
  if (!canAccessPatient(req.user, findPatient(patientId))) {
    return res
      .status(403)
      .json({ error: "You are not authorized to access these medications." });
  }
  const medications = db.data.medications.filter(
    (m) => m.patientId === patientId
  );

  let total = 0;
  let taken = 0;
  let missed = 0;
  let skipped = 0;

  medications.forEach((m) => {
    (m.logs || []).forEach((log) => {
      total++;
      if (log.status === "taken") taken++;
      else if (log.status === "missed") missed++;
      else if (log.status === "skipped") skipped++;
    });
  });

  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

  res.json({
    medications,
    adherenceRate,
    stats: { total, taken, missed, skipped },
  });
});

// POST /api/medications/:medId/log - Log a dose (taken, missed, skipped)
router.post("/:medId/log", (req, res) => {
  const { status, reason, time } = req.body;
  const medId = req.params.medId;

  if (!["taken", "missed", "skipped"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Status must be 'taken', 'missed', or 'skipped'." });
  }

  const med = db.data.medications.find((m) => m.id === medId);
  if (!med) {
    return res.status(404).json({ error: "Medication not found." });
  }

  const patient = db.data.patients.find((p) => p.id === med.patientId);
  if (!canAccessPatient(req.user, patient)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update this medication." });
  }

  const logEntry = {
    date: new Date().toISOString().split("T")[0],
    time: time || new Date().toTimeString().split(" ")[0].substring(0, 5),
    status,
    reason:
      reason ||
      (status === "taken"
        ? "Dose taken on schedule"
        : "Patient reported omission"),
  };

  if (!med.logs) med.logs = [];
  med.logs.push(logEntry);

  // Check for repeated missed medication alerts
  const newAlerts = checkMedicationAlerts(
    patient,
    db.data.medications,
    db.data.thresholds?.consecutiveMissedMedsAlert || 2
  );

  if (newAlerts.length > 0) {
    // Avoid exact duplicate alerts if one already exists for this medication
    const existing = db.data.alerts.find(
      (a) =>
        a.patientId === patient.id &&
        a.type.includes("Medication") &&
        a.triggeringParameter === med.name &&
        a.status !== "resolved"
    );

    if (!existing) {
      db.data.alerts.unshift(...newAlerts);
    }
  }

  db.save();

  res.json({
    message: `Medication marked as ${status}.`,
    medication: med,
    alertsGenerated: newAlerts,
  });
});

// POST /api/medications - Doctor prescribes a new medication
router.post("/", (req, res) => {
  const {
    patientId,
    name,
    dosage,
    frequency,
    timeSlots,
    startDate,
    endDate,
    instructions,
    critical,
  } = req.body;

  if (!patientId || !name || !dosage) {
    return res
      .status(400)
      .json({ error: "patientId, name, and dosage are required." });
  }

  const patient = findPatient(patientId);
  if (
    !patient ||
    !canAccessPatient(req.user, patient) ||
    req.user.role === "patient"
  ) {
    return res
      .status(403)
      .json({
        error:
          "Only an assigned doctor or administrator can prescribe medication.",
      });
  }

  const newMed = {
    id: `MED-${Date.now()}`,
    patientId,
    name,
    dosage,
    frequency: frequency || "Once daily",
    timeSlots: timeSlots || ["09:00"],
    startDate: startDate || new Date().toISOString().split("T")[0],
    endDate: endDate || "",
    instructions: instructions || "Take with water as directed.",
    critical: Boolean(critical),
    logs: [],
  };

  db.data.medications.push(newMed);
  db.save();

  res
    .status(201)
    .json({
      message: "Medication prescribed successfully.",
      medication: newMed,
    });
});

export default router;
