import express from "express";
import jwt from "jsonwebtoken";
import { db } from "../services/db.js";
import { savePatientToExcel } from "../services/excelStorage.js";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "post-hospital-recovery-secret-key-2026";

const generateToken = (user, role) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

const isGmailAddress = (email) =>
  email.endsWith("@gmail.com") || email.endsWith("@googlemail.com");
const createUnassignedDoctor = ({ email, name, googleId = null }) => ({
  id: `DOC-G-${Date.now().toString().slice(-8)}`,
  name: name || `Doctor ${email.split("@")[0]}`,
  role: "Independent Doctor (Unassigned)",
  department: "Post-Acute Care",
  hospital: "St. Jude Metropolitan Hospital",
  email,
  googleId,
  password: "doctor123",
  phone: "",
});
const staffResponse = (account, role) => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role,
  department: account.department,
  hospital: account.hospital,
  phone: account.phone,
});
const patientResponse = (patient) => ({
  id: patient.id,
  name: patient.name,
  email: patient.email,
  role: "patient",
  diagnosis: patient.diagnosis,
  doctorName: patient.doctorName,
  currentRiskLevel: patient.currentRiskLevel,
  recoveryStatus: patient.recoveryStatus,
});

router.post("/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ error: "Email/User ID and password are required." });

  if (role === "doctor" || role === "admin") {
    const doctor = db.data.doctors.find(
      (account) =>
        (account.email.toLowerCase() === email.toLowerCase() ||
          account.id.toLowerCase() === email.toLowerCase()) &&
        account.password === password
    );
    if (doctor) {
      const resolvedRole = doctor.role.toLowerCase().includes("admin")
        ? "admin"
        : "doctor";
      if (role === "admin" && resolvedRole !== "admin")
        return res
          .status(403)
          .json({ error: "This account is not an administrator." });
      return res.json({
        token: generateToken(doctor, resolvedRole),
        user: staffResponse(doctor, resolvedRole),
      });
    }
    if (
      role === "doctor" &&
      isGmailAddress(email.toLowerCase()) &&
      password === "doctor123"
    ) {
      const newDoctor = createUnassignedDoctor({ email: email.toLowerCase() });
      db.data.doctors.push(newDoctor);
      db.save();
      return res
        .status(201)
        .json({
          token: generateToken(newDoctor, "doctor"),
          user: staffResponse(newDoctor, "doctor"),
          message:
            "Doctor account created. An administrator must assign patients before clinical records are visible.",
        });
    }
    return res
      .status(401)
      .json({ error: "Invalid healthcare provider credentials." });
  }

  const patient = db.data.patients.find(
    (account) =>
      (account.email.toLowerCase() === email.toLowerCase() ||
        account.id.toLowerCase() === email.toLowerCase()) &&
      account.password === password
  );
  if (!patient)
    return res
      .status(401)
      .json({
        error:
          "Invalid credentials. Please check your Patient ID/Email and password.",
      });
  return res.json({
    token: generateToken(patient, "patient"),
    user: patientResponse(patient),
  });
});

router.post("/google", async (req, res) => {
  const { credential, role = "patient" } = req.body;
  if (!credential)
    return res.status(400).json({ error: "Google credential is required." });
  try {
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential
      )}`
    );
    const googleUser = await googleResponse.json();
    if (!googleResponse.ok || googleUser.email_verified !== "true")
      return res
        .status(401)
        .json({ error: "Google account verification failed." });
    if (
      process.env.GOOGLE_CLIENT_ID &&
      googleUser.aud !== process.env.GOOGLE_CLIENT_ID
    )
      return res
        .status(401)
        .json({
          error: "Google account is not authorized for this application.",
        });
    if (!["patient", "doctor", "admin"].includes(role))
      return res.status(400).json({ error: "Invalid account type." });

    const email = googleUser.email.toLowerCase();
    const existingPatient = db.data.patients.find(
      (account) =>
        account.googleId === googleUser.sub ||
        account.email.toLowerCase() === email
    );
    const existingDoctor = db.data.doctors.find(
      (account) =>
        account.googleId === googleUser.sub ||
        account.email.toLowerCase() === email
    );
    if (role === "patient" && existingDoctor && !existingPatient)
      return res
        .status(403)
        .json({
          error:
            "This Google account is registered as healthcare staff. Use the Doctor/Admin login.",
        });
    if (role !== "patient" && existingPatient && !existingDoctor)
      return res
        .status(403)
        .json({
          error:
            "This Google account is registered as a patient. Use the Patient login.",
        });

    let account = existingPatient || existingDoctor;
    let resolvedRole = existingPatient
      ? "patient"
      : existingDoctor
      ? existingDoctor.role.toLowerCase().includes("admin")
        ? "admin"
        : "doctor"
      : null;
    if (!account) {
      if (!isGmailAddress(email))
        return res
          .status(403)
          .json({
            error: "Only verified Gmail accounts can use this sign-in option.",
          });
      if (role === "admin")
        return res
          .status(403)
          .json({
            error:
              "Admin Google access requires a registered administrator account.",
          });
      if (role === "doctor") {
        account = createUnassignedDoctor({
          email,
          name: googleUser.name,
          googleId: googleUser.sub,
        });
        db.data.doctors.push(account);
        resolvedRole = "doctor";
      } else {
        account = {
          id: `PMR-G-${Date.now().toString().slice(-8)}`,
          name: googleUser.name || email.split("@")[0],
          age: 18,
          gender: "Not specified",
          phone: "",
          email,
          googleId: googleUser.sub,
          password: `google-${googleUser.sub}`,
          address: "",
          emergencyContactName: "Not specified",
          emergencyContactPhone: "",
          bloodGroup: "Unknown",
          disease: "Post-Hospitalization Recovery",
          diseaseCategory: "General Recovery",
          existingConditions: [],
          allergies: ["None known"],
          currentMedications: [],
          medicalHistory: "Registered through verified Google patient sign-in.",
          hospitalName: "St. Jude Metropolitan Hospital",
          doctorName: "Dr. Sarah Jenkins, MD",
          doctorId: "DOC-101",
          admissionDate: new Date().toISOString().split("T")[0],
          dischargeDate: new Date().toISOString().split("T")[0],
          hospitalizationReason: "Post-hospitalization monitoring enrollment",
          diagnosis: "Post-Hospitalization Recovery",
          dischargeInstructions:
            "Follow the monitoring schedule and contact your care team with concerns.",
          followUpDate: new Date(Date.now() + 7 * 86400000)
            .toISOString()
            .split("T")[0],
          recoveryStatus: "Initial Monitoring",
          currentRiskLevel: "Low Risk",
          riskScore: 20,
        };
        db.data.patients.push(account);
        resolvedRole = "patient";
      }
    }
    account.googleId = googleUser.sub;
    db.save();
    return res.json({
      token: generateToken(account, resolvedRole),
      user:
        resolvedRole === "patient"
          ? patientResponse(account)
          : staffResponse(account, resolvedRole),
    });
  } catch (error) {
    console.error("Google authentication failed:", error);
    return res
      .status(502)
      .json({ error: "Unable to verify Google authentication." });
  }
});

router.post("/register", async (req, res) => {
  const {
    fullName,
    age,
    gender,
    phone,
    email,
    password,
    address,
    emergencyContactName,
    emergencyContactPhone,
    bloodGroup,
    existingConditions,
    allergies,
    currentMedications,
    medicalHistory,
    hospitalName,
    doctorName,
    admissionDate,
    dischargeDate,
    hospitalizationReason,
    diagnosis,
    dischargeInstructions,
    followUpDate,
  } = req.body;

  const normalizedEmail = String(email || "").trim();
  const normalizedName = String(fullName || "").trim();

  if (!normalizedName || !normalizedEmail || !String(password || "").trim())
    return res
      .status(400)
      .json({ error: "Full Name, Email, and Password are required." });

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail))
    return res.status(400).json({ error: "Please provide a valid email address." });

  if (Number(age) < 1 || Number(age) > 120)
    return res.status(400).json({ error: "Patient age must be between 1 and 120." });

  if (
    db.data.patients.some(
      (patient) => patient.email.toLowerCase() === normalizedEmail.toLowerCase()
    )
  )
    return res
      .status(400)
      .json({ error: "An account with this email already exists." });

  const newPatient = {
    id: `PMR-2026-${String(db.data.patients.length + 1).padStart(4, "0")}`,
    name: normalizedName,
    age: Number(age) || 45,
    gender: gender || "Other",
    phone: phone || "",
    email,
    password,
    address: address || "",
    emergencyContactName: emergencyContactName || "Not Specified",
    emergencyContactPhone: emergencyContactPhone || "",
    bloodGroup: bloodGroup || "Unknown",
    existingConditions: Array.isArray(existingConditions)
      ? existingConditions
      : existingConditions
      ? existingConditions.split(",").map((value) => value.trim())
      : [],
    allergies: Array.isArray(allergies)
      ? allergies
      : allergies
      ? allergies.split(",").map((value) => value.trim())
      : ["None"],
    currentMedications: Array.isArray(currentMedications)
      ? currentMedications
      : currentMedications
      ? currentMedications.split(",").map((value) => value.trim())
      : [],
    medicalHistory: medicalHistory || "No significant prior history reported.",
    hospitalName: hospitalName || "St. Jude Metropolitan Hospital",
    doctorName: doctorName || "Dr. Sarah Jenkins, MD",
    doctorId: "DOC-101",
    admissionDate: admissionDate || new Date().toISOString().split("T")[0],
    dischargeDate: dischargeDate || new Date().toISOString().split("T")[0],
    hospitalizationReason: hospitalizationReason || "Acute hospitalization",
    diagnosis: diagnosis || "Post-Acute Medical Recovery",
    dischargeInstructions:
      dischargeInstructions ||
      "Follow standard post-discharge recovery precautions.",
    followUpDate:
      followUpDate ||
      new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    recoveryStatus: "Initial Monitoring",
    currentRiskLevel: "Low Risk",
    riskScore: 20,
  };

  let patientWasPersisted = false;

  try {
    db.data.patients.push(newPatient);
    db.save();
    patientWasPersisted = true;
    console.log("PATIENT_DATABASE_SAVE_SUCCESS");

    const excelResult = savePatientToExcel(newPatient);
    if (!excelResult?.excelSaved) {
      throw new Error("Excel workbook save did not complete successfully.");
    }

    return res.status(201).json({
      success: true,
      message: "Patient created and Excel report saved successfully",
      patientId: newPatient.id,
      excelSaved: true,
      token: generateToken(newPatient, "patient"),
      user: patientResponse(newPatient),
    });
  } catch (error) {
    if (patientWasPersisted) {
      db.data.patients = db.data.patients.filter((patient) => patient.id !== newPatient.id);
      db.save();
    }

    console.error("EXCEL_SAVE_FAILED");
    console.error("ERROR:", error?.message || error);
    console.error("FILE_PATH:", new URL("../data/patient_registry.xlsx", import.meta.url).pathname);
    return res.status(500).json({
      success: false,
      message: "Patient creation failed because the Excel report could not be saved",
      excelSaved: false,
    });
  }
});

export default router;
