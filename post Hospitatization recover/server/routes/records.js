import express from "express";
import { appendClinicalRecord } from "../services/excelStorage.js";
import { requirePatientAccess } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  requirePatientAccess((req) =>
    req.user.role === "patient" ? req.user.id : req.body.patientId
  ),
  (req, res) => {
    const patient = req.patient;
    const checkin = req.body.checkin || {};
    const symptoms = req.body.symptoms || checkin.otherSymptoms || "";
    const record = {
      Timestamp: req.body.timestamp || new Date().toISOString(),
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
      "Risk Level": req.body.riskLevel || patient.currentRiskLevel || "",
      "Blood Glucose": checkin.bloodGlucose ?? req.body.bloodGlucose ?? "",
      "Blood Pressure":
        checkin.bloodPressure ||
        (checkin.bloodPressureSys != null
          ? `${checkin.bloodPressureSys}/${checkin.bloodPressureDia}`
          : req.body.bloodPressure || ""),
      "Heart Rate": checkin.heartRate ?? req.body.heartRate ?? "",
      SpO2: checkin.spO2 ?? req.body.spO2 ?? "",
      Temperature: checkin.temperature ?? req.body.temperature ?? "",
      Weight: checkin.weight ?? req.body.weight ?? "",
      Symptoms: symptoms,
      Medication: req.body.medication || "",
      "AI Risk Result": req.body.aiRiskResult || patient.currentRiskLevel || "",
      "Doctor Instructions":
        req.body.doctorInstructions || patient.dischargeInstructions || "",
    };

    const result = appendClinicalRecord(record);
    res
      .status(201)
      .json({
        message: "Clinical record appended without overwriting existing rows.",
        row: result.row,
        columns: result.columns,
      });
  }
);

export default router;
