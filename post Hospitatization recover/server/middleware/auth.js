import jwt from "jsonwebtoken";
import { db } from "../services/db.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "post-hospital-recovery-secret-key-2026";

export const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Invalid or expired authentication token." });
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to perform this action." });
    }
    next();
  };

export const findPatient = (patientId) =>
  (db.data.patients || []).find((patient) => patient.id === patientId) || null;

export const canAccessPatient = (user, patient) => {
  if (!user || !patient) return false;
  if (user.role === "admin") return true;
  if (user.role === "doctor") return patient.doctorId === user.id;
  return user.role === "patient" && patient.id === user.id;
};

export const requirePatientAccess = (getPatientId) => (req, res, next) => {
  const patientId = getPatientId(req);
  const patient = findPatient(patientId);

  if (!patient) {
    return res.status(404).json({ error: "Patient not found." });
  }

  if (!canAccessPatient(req.user, patient)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to access this patient." });
  }

  req.patient = patient;
  next();
};
