import express from "express";
import { db } from "../services/db.js";
import { canAccessPatient, findPatient } from "../middleware/auth.js";

const router = express.Router();

// POST /api/emergency/trigger - Patient activates emergency assistance
router.post("/trigger", (req, res) => {
  const { patientId, notes } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: "patientId is required." });
  }

  const patient = findPatient(
    req.user.role === "patient" ? req.user.id : patientId
  );
  if (!patient) {
    return res.status(404).json({ error: "Patient not found." });
  }
  if (!canAccessPatient(req.user, patient)) {
    return res
      .status(403)
      .json({
        error:
          "You are not authorized to activate emergency assistance for this patient.",
      });
  }

  const now = new Date().toISOString();

  // Create Critical Alert for Doctors & Care Team
  const emergencyAlert = {
    id: `ALT-EMG-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    type: "EMERGENCY ASSISTANCE ACTIVATED",
    severity: "critical",
    triggeringParameter: "Patient SOS Trigger",
    currentValue: "Emergency Assistance Button Pressed",
    previousValue: "Monitoring Active",
    trendSummary: `Patient pressed Emergency Assistance button. Address on file: ${
      patient.address
    }. Emergency Contact: ${patient.emergencyContactName} (${
      patient.emergencyContactPhone
    }). Notes: ${notes || "Immediate assistance requested."}`,
    timestamp: now,
    status: "new",
    recommendedAction: `IMMEDIATE TRIAGE: Call patient at ${patient.phone} or emergency contact at ${patient.emergencyContactPhone}. Prepare emergency dispatch if no contact established.`,
  };

  db.data.alerts.unshift(emergencyAlert);

  // Update patient's recovery status
  patient.recoveryStatus = "EMERGENCY ACTIVE";
  patient.currentRiskLevel = "High Risk";
  patient.riskScore = 99;

  // Log urgent message
  db.data.messages.unshift({
    id: `MSG-EMG-${Date.now()}`,
    patientId: patient.id,
    senderRole: "system",
    senderName: "Automated Clinical Dispatch",
    recipientRole: "doctor",
    subject: `CRITICAL: Emergency Alert for ${patient.name}`,
    category: "alert_followup",
    content: `Patient ${patient.name} (${
      patient.id
    }) activated Emergency Assistance at ${new Date().toLocaleTimeString()}. The attending team has been notified.`,
    timestamp: now,
    read: false,
  });

  db.save();

  res.json({
    message: "Emergency assistance protocol activated. Care team notified.",
    alert: emergencyAlert,
    emergencyInfo: {
      patientName: patient.name,
      patientPhone: patient.phone,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      hospitalName: patient.hospitalName,
      hospitalEmergencyHotline: "+1 (800) 555-9911",
      nationalEmergencyNumber: "911 / 112",
      address: patient.address,
    },
  });
});

export default router;
