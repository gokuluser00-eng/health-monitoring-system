import express from "express";
import { db } from "../services/db.js";
import { requireRole } from "../middleware/auth.js";

const router = express.Router();

router.put("/patients/:patientId/doctor", requireRole("admin"), (req, res) => {
  const patient = db.data.patients.find(
    (item) => item.id === req.params.patientId
  );
  const doctor = db.data.doctors.find((item) => item.id === req.body.doctorId);

  if (!patient || !doctor) {
    return res.status(404).json({ error: "Patient or doctor not found." });
  }

  patient.doctorId = doctor.id;
  patient.doctorName = doctor.name;
  db.save();

  res.json({
    message: "Doctor assignment updated successfully.",
    assignment: {
      patientId: patient.id,
      doctorId: doctor.id,
      doctorName: doctor.name,
    },
  });
});

export default router;
