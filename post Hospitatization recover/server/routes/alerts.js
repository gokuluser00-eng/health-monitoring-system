import express from "express";
import { db } from "../services/db.js";
import { canAccessPatient, findPatient } from "../middleware/auth.js";

const router = express.Router();

// GET /api/alerts - List all alerts with filtering
router.get("/", (req, res) => {
  const { status, severity, patientId } = req.query;

  let alerts = [...db.data.alerts]
    .filter((alert) => canAccessPatient(req.user, findPatient(alert.patientId)))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (status && status !== "all") {
    alerts = alerts.filter(
      (a) => a.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (severity && severity !== "all") {
    alerts = alerts.filter(
      (a) => a.severity.toLowerCase() === severity.toLowerCase()
    );
  }

  if (patientId) {
    alerts = alerts.filter((a) => a.patientId === patientId);
  }

  const counts = {
    total: alerts.length,
    new: alerts.filter((a) => a.status === "new").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    under_review: alerts.filter((a) => a.status === "under_review").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    critical: alerts.filter(
      (a) => a.severity === "critical" && a.status !== "resolved"
    ).length,
    warning: alerts.filter(
      (a) => a.severity === "warning" && a.status !== "resolved"
    ).length,
  };

  res.json({ alerts, counts });
});

// PUT /api/alerts/:id - Update alert status (acknowledge, review, resolve)
router.put("/:id", (req, res) => {
  const { status, notes, resolvedBy } = req.body;
  const alert = db.data.alerts.find((a) => a.id === req.params.id);

  if (!alert) {
    return res.status(404).json({ error: "Alert not found." });
  }
  if (!canAccessPatient(req.user, findPatient(alert.patientId))) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update this alert." });
  }

  if (status) {
    alert.status = status;
  }

  if (notes !== undefined) {
    alert.notes = notes;
  }

  if (status === "resolved") {
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy || "Attending Healthcare Provider";
  }

  if (status === "acknowledged") {
    alert.acknowledgedAt = new Date().toISOString();
  }

  db.save();

  res.json({ message: "Alert updated successfully.", alert });
});

export default router;
