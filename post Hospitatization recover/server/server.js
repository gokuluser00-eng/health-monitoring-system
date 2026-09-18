import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import patientsRoutes from "./routes/patients.js";
import checkinsRoutes from "./routes/checkins.js";
import medicationsRoutes from "./routes/medications.js";
import alertsRoutes from "./routes/alerts.js";
import followupsRoutes from "./routes/followups.js";
import messagesRoutes from "./routes/messages.js";
import configRoutes from "./routes/config.js";
import emergencyRoutes from "./routes/emergency.js";
import prehospitalRoutes from "./routes/prehospital.js";
import diseaseDatabasesRoutes from "./routes/diseaseDatabases.js";
import ageRecoveryRoutes from "./routes/ageRecovery.js";
import chatbotRoutes from "./routes/chatbot.js";
import monitoringRoutes from "./routes/monitoring.js";
import recordsRoutes from "./routes/records.js";
import assignmentsRoutes from "./routes/assignments.js";
import { authenticateToken, requireRole } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.options("*", cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", authenticateToken, patientsRoutes);
app.use("/api/checkins", authenticateToken, checkinsRoutes);
app.use("/api/medications", authenticateToken, medicationsRoutes);
app.use("/api/alerts", authenticateToken, alertsRoutes);
app.use("/api/followups", authenticateToken, followupsRoutes);
app.use("/api/messages", authenticateToken, messagesRoutes);
app.use("/api/config", authenticateToken, configRoutes);
app.use("/api/emergency", authenticateToken, emergencyRoutes);
app.use("/api/prehospital", prehospitalRoutes);
app.use(
  "/api/diseases",
  authenticateToken,
  requireRole("admin", "doctor"),
  diseaseDatabasesRoutes
);
app.use(
  "/api/analytics",
  authenticateToken,
  requireRole("admin", "doctor"),
  ageRecoveryRoutes
);
app.use("/api/chatbot", authenticateToken, chatbotRoutes);
app.use("/api/monitoring", authenticateToken, monitoringRoutes);
app.use("/api/records", authenticateToken, recordsRoutes);
app.use("/api/assignments", authenticateToken, assignmentsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Post-Hospitalization Monitoring and Risk Prediction Platform API",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(
    `[Backend] Post-Hospitalization Monitoring API running on http://localhost:${PORT}`
  );
});
