import express from "express";
import { db } from "../services/db.js";
import { buildMonitoringSchedule } from "../services/scheduleEngine.js";
import {
  canAccessPatient,
  findPatient,
  requirePatientAccess,
} from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/:patientId",
  requirePatientAccess((req) => req.params.patientId),
  (req, res) => {
    const patient = req.patient;
    const override = db.data.monitoringSchedules?.[patient.id] || null;
    res.json({
      schedule: buildMonitoringSchedule(patient, { doctorOverride: override }),
    });
  }
);

router.put(
  "/:patientId",
  requirePatientAccess((req) => req.params.patientId),
  (req, res) => {
    const patient = findPatient(req.params.patientId);
    if (req.user.role === "patient" || !canAccessPatient(req.user, patient)) {
      return res
        .status(403)
        .json({
          error:
            "Only an assigned doctor or administrator can override a monitoring schedule.",
        });
    }

    const { monitoring_plan, daily_summary } = req.body;
    if (!Array.isArray(monitoring_plan) || monitoring_plan.length === 0) {
      return res
        .status(400)
        .json({ error: "monitoring_plan must be a non-empty array." });
    }

    const override = {
      monitoring_plan,
      daily_summary: daily_summary || "Doctor-reviewed monitoring schedule.",
      doctorId: req.user.id,
      updatedAt: new Date().toISOString(),
    };
    db.data.monitoringSchedules[patient.id] = override;
    patient.doctorMonitoringSchedule = override;
    db.save();

    res.json({
      schedule: buildMonitoringSchedule(patient, { doctorOverride: override }),
    });
  }
);

export default router;
