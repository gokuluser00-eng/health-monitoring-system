import express from "express";
import { db } from "../services/db.js";
import { calculateRiskPrediction } from "../services/riskEngine.js";
import { evaluateAlerts } from "../services/alertEngine.js";
import { requirePatientAccess } from "../middleware/auth.js";
import { appendClinicalRecord } from "../services/excelStorage.js";

const router = express.Router();

// POST /api/checkins - Submit daily health check-in
router.post(
  "/",
  requirePatientAccess((req) =>
    req.user.role === "patient" ? req.user.id : req.body.patientId
  ),
  (req, res) => {
    const {
      patientId,
      heartRate,
      spO2,
      temperature,
      bloodPressureSys,
      bloodPressureDia,
      respiratoryRate,
      bloodGlucose,
      painLevel,
      fatigueLevel,
      sleepQuality,
      appetite,
      dizziness,
      breathingDifficulty,
      chestDiscomfort,
      swelling,
      nausea,
      otherSymptoms,
      notes,
      measurementMode,
    } = req.body;

    const effectivePatientId =
      req.user.role === "patient" ? req.user.id : patientId;

    if (!effectivePatientId) {
      return res.status(400).json({ error: "patientId is required." });
    }

    const patient = db.data.patients.find((p) => p.id === effectivePatientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    // Get previous checkin for trend evaluation
    const previousCheckins = db.data.checkins
      .filter((c) => c.patientId === effectivePatientId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const previousCheckin = previousCheckins[0] || null;

    // Calculate current medication adherence rate
    const patientMeds = db.data.medications.filter(
      (m) => m.patientId === effectivePatientId
    );
    let totalDoses = 0;
    let takenDoses = 0;
    patientMeds.forEach((m) => {
      (m.logs || []).forEach((log) => {
        totalDoses++;
        if (log.status === "taken") takenDoses++;
      });
    });
    const medAdherenceRate =
      totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

    // Build current reading object
    const currentReading = {
      heartRate:
        heartRate !== undefined && heartRate !== "" ? Number(heartRate) : null,
      spO2: spO2 !== undefined && spO2 !== "" ? Number(spO2) : null,
      temperature:
        temperature !== undefined && temperature !== ""
          ? Number(temperature)
          : null,
      bloodPressureSys:
        bloodPressureSys !== undefined && bloodPressureSys !== ""
          ? Number(bloodPressureSys)
          : null,
      bloodPressureDia:
        bloodPressureDia !== undefined && bloodPressureDia !== ""
          ? Number(bloodPressureDia)
          : null,
      respiratoryRate:
        respiratoryRate !== undefined && respiratoryRate !== ""
          ? Number(respiratoryRate)
          : null,
      bloodGlucose:
        bloodGlucose !== undefined && bloodGlucose !== ""
          ? Number(bloodGlucose)
          : null,
      painLevel: Number(painLevel) || 0,
      fatigueLevel: Number(fatigueLevel) || 0,
      sleepQuality: sleepQuality || "Good",
      appetite: appetite || "Normal",
      dizziness: Boolean(dizziness),
      breathingDifficulty: Boolean(breathingDifficulty),
      chestDiscomfort: Boolean(chestDiscomfort),
      swelling: Boolean(swelling),
      nausea: Boolean(nausea),
      otherSymptoms: otherSymptoms || "",
      notes: notes || "",
      measurementMode: measurementMode === "device" ? "device" : "manual",
    };

    // Run AI Risk Prediction Engine
    const riskAssessment = calculateRiskPrediction(
      currentReading,
      previousCheckin,
      patient,
      medAdherenceRate,
      db.data.thresholds || {}
    );

    // Evaluate Early Warning Alerts
    const newAlerts = evaluateAlerts(
      currentReading,
      previousCheckin,
      patient,
      patientMeds,
      db.data.thresholds || {}
    );

    // Add alerts to database
    if (newAlerts.length > 0) {
      db.data.alerts.unshift(...newAlerts);
    }

    // Create checkin record
    const checkinId = `CHK-${Date.now()}`;
    const newCheckin = {
      id: checkinId,
      patientId: effectivePatientId,
      timestamp: new Date().toISOString(),
      ...currentReading,
      riskScore: riskAssessment.score,
      riskLevel: riskAssessment.riskLevel,
      contributingFactors: riskAssessment.contributingFactors,
      recommendedAction: riskAssessment.recommendedAction,
    };

    db.data.checkins.push(newCheckin);

    // Update patient's current risk status in patient profile
    patient.currentRiskLevel = riskAssessment.riskLevel;
    patient.riskScore = riskAssessment.score;
    patient.recoveryStatus =
      riskAssessment.riskLevel === "High Risk"
        ? "High Alert - Active Warning"
        : riskAssessment.riskLevel === "Moderate Risk"
        ? "Under Close Observation"
        : "Normal Recovery";

    db.save();

    let excelAppend = null;
    try {
      excelAppend = appendClinicalRecord({
        Timestamp: newCheckin.timestamp,
        "Patient ID": patient.id,
        "Patient Name": patient.name,
        "Doctor ID": patient.doctorId || "",
        Disease: patient.disease || patient.diseaseCategory || "",
        "Age Group":
          Number(patient.age) <= 17
            ? "Child"
            : Number(patient.age) >= 60
            ? "Senior Citizen"
            : "Adult",
        "Risk Level": riskAssessment.riskLevel,
        "Blood Glucose": newCheckin.bloodGlucose ?? "",
        "Blood Pressure":
          newCheckin.bloodPressureSys != null
            ? `${newCheckin.bloodPressureSys}/${newCheckin.bloodPressureDia}`
            : "",
        "Heart Rate": newCheckin.heartRate ?? "",
        SpO2: newCheckin.spO2 ?? "",
        Temperature: newCheckin.temperature ?? "",
        Weight: req.body.weight ?? "",
        Symptoms: newCheckin.otherSymptoms,
        Medication: req.body.medicationStatus || "",
        "AI Risk Result": riskAssessment.riskLevel,
        "Doctor Instructions": patient.dischargeInstructions || "",
      });
    } catch (error) {
      console.error("Unable to append check-in to Excel storage:", error);
    }

    res.status(201).json({
      message: "Daily health check-in submitted successfully.",
      checkin: newCheckin,
      riskAssessment,
      newAlerts,
      excelAppend: excelAppend ? { row: excelAppend.row } : null,
    });
  }
);

// GET /api/checkins/:patientId - Get checkin history
router.get(
  "/:patientId",
  requirePatientAccess((req) => req.params.patientId),
  (req, res) => {
    const checkins = db.data.checkins
      .filter((c) => c.patientId === req.params.patientId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ checkins });
  }
);

export default router;
