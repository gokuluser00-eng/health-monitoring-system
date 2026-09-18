import express from "express";
import { db } from "../services/db.js";
import { canAccessPatient, findPatient } from "../middleware/auth.js";

const router = express.Router();

// GET /api/followups
router.get("/", (req, res) => {
  const { patientId, doctorId, status } = req.query;

  let followups = [...db.data.followups]
    .filter((followup) =>
      canAccessPatient(req.user, findPatient(followup.patientId))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (patientId) {
    followups = followups.filter((f) => f.patientId === patientId);
  }
  if (doctorId) {
    followups = followups.filter((f) => f.doctorId === doctorId);
  }
  if (status && status !== "all") {
    followups = followups.filter((f) => f.status === status);
  }

  res.json({ followups });
});

// POST /api/followups - Schedule new follow-up
router.post("/", (req, res) => {
  const { patientId, doctorId, date, time, type, clinic, purpose, notes } =
    req.body;

  if (!patientId || !date || !time) {
    return res
      .status(400)
      .json({ error: "patientId, date, and time are required." });
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
          "Only an assigned doctor or administrator can schedule follow-ups.",
      });
  }
  const effectiveDoctorId = req.user.role === "doctor" ? req.user.id : doctorId;
  const doctor =
    db.data.doctors.find((d) => d.id === effectiveDoctorId) ||
    db.data.doctors[0];

  const newFollowup = {
    id: `FLW-${Date.now()}`,
    patientId,
    patientName: patient ? patient.name : "Patient",
    doctorId: doctor.id,
    doctorName: doctor.name,
    date,
    time,
    type: type || "Clinic Visit",
    clinic: clinic || "Outpatient Care Center",
    purpose: purpose || "Post-Discharge Recovery Assessment",
    notes: notes || "",
    status: "scheduled",
  };

  db.data.followups.push(newFollowup);

  // Also update patient's next followUpDate if sooner
  if (patient) {
    patient.followUpDate = date;
  }

  // Generate automated message notification to patient
  const reminderMsg = {
    id: `MSG-${Date.now()}`,
    patientId,
    senderRole: "doctor",
    senderName: doctor.name,
    recipientRole: "patient",
    subject: `Follow-up Appointment Scheduled: ${date} at ${time}`,
    category: "reminder",
    content: `A post-discharge follow-up appointment has been scheduled for ${date} at ${time} (${type}) with ${doctor.name}. Purpose: ${purpose}. Location: ${clinic}.`,
    timestamp: new Date().toISOString(),
    read: false,
  };
  db.data.messages.unshift(reminderMsg);

  db.save();

  res
    .status(201)
    .json({
      message: "Follow-up scheduled successfully.",
      followup: newFollowup,
    });
});

// PUT /api/followups/:id - Update status
router.put("/:id", (req, res) => {
  const followup = db.data.followups.find((f) => f.id === req.params.id);
  if (!followup) {
    return res.status(404).json({ error: "Follow-up not found." });
  }
  if (!canAccessPatient(req.user, findPatient(followup.patientId))) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update this follow-up." });
  }

  const { status, notes, date, time } = req.body;
  if (status) followup.status = status;
  if (notes !== undefined) followup.notes = notes;
  if (date) followup.date = date;
  if (time) followup.time = time;

  // If marked missed, trigger an alert
  if (status === "missed") {
    const existing = db.data.alerts.find(
      (a) =>
        a.patientId === followup.patientId &&
        a.type.includes("Follow-up") &&
        a.status !== "resolved"
    );
    if (!existing) {
      db.data.alerts.unshift({
        id: `ALT-${Date.now()}-missed-flw`,
        patientId: followup.patientId,
        patientName: followup.patientName,
        type: "Missed Scheduled Follow-Up Appointment",
        severity: "warning",
        triggeringParameter: "Follow-Up Attendance",
        currentValue: `Missed: ${followup.date} ${followup.time}`,
        previousValue: "Scheduled",
        trendSummary: `Patient did not attend their ${followup.type} scheduled with ${followup.doctorName}. High risk of unmonitored relapse.`,
        timestamp: new Date().toISOString(),
        status: "new",
        recommendedAction:
          "Call patient or emergency contact to reschedule urgent post-discharge appointment.",
      });
    }
  }

  db.save();
  res.json({ message: "Follow-up updated successfully.", followup });
});

export default router;
