import express from "express";
import { db } from "../services/db.js";
import { canAccessPatient, findPatient } from "../middleware/auth.js";

const router = express.Router();

// Emergency trigger keywords that immediately escalate to Emergency SOS
const EMERGENCY_KEYWORDS = [
  "suddenly very difficult",
  "cannot breathe",
  "hard to breathe",
  "trouble breathing",
  "chest pain",
  "chest discomfort",
  "crushing pain",
  "arm numb",
  "facial drooping",
  "slurred speech",
  "passed out",
  "fainted",
  "seizure",
  "worst headache",
  "bleeding heavily",
  "coughing blood",
];

// POST /api/chatbot/message (Section 15)
router.post("/message", (req, res) => {
  const { message = "" } = req.body;
  const requestedPatientId = req.body.patientId;
  const patientId =
    req.user.role === "patient" ? req.user.id : requestedPatientId;
  const requestedPatient = requestedPatientId
    ? findPatient(requestedPatientId)
    : null;
  const patient = patientId ? findPatient(patientId) : null;
  if (
    requestedPatientId &&
    (!requestedPatient || !canAccessPatient(req.user, requestedPatient))
  ) {
    return res.status(403).json({
      error: "You are not authorized to use chatbot context for this patient.",
    });
  }

  const q = message.trim().toLowerCase();

  // 1. Emergency Escalation Check (Section 15 Emergency Guidance Priority)
  const isEmergencyTriggered = EMERGENCY_KEYWORDS.some((k) => q.includes(k));
  if (isEmergencyTriggered) {
    return res.json({
      sender: "HealthAssist AI",
      isEmergency: true,
      alertLevel: "EMERGENCY_ESCALATION",
      reply: `🚨 **EMERGENCY WARNING DETECTED**\n\nBased on what you just described, this could indicate an acute medical emergency.\n\n**Please take immediate action:**\n1. **Call 911 (or your local emergency services)** right away.\n2. Do NOT attempt to drive yourself to the hospital; request emergency medical dispatch.\n3. Notify someone in your household or your primary emergency contact.\n4. Stay seated upright in a well-ventilated space while waiting for emergency responders.\n\n*HealthAssist AI is an educational monitoring assistant and cannot provide emergency interventions.*`,
      emergencyHotline: "911",
      quickActions: ["Call 911 Emergency Dispatch", "Open Emergency SOS Modal"],
    });
  }

  // Retrieve patient context if provided
  let baseline = null;
  if (patientId) {
    baseline = db.getPatientBaseline(patientId);
  }

  const patientCheckins = patientId
    ? (db.data.checkins || [])
        .filter((checkin) => checkin.patientId === patientId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];
  const requestedDay = q.includes("yesterday")
    ? new Date(Date.now() - 86400000)
    : new Date();
  const requestedDate = requestedDay.toISOString().slice(0, 10);
  const dayCheckins = patientCheckins.filter(
    (checkin) => checkin.timestamp?.slice(0, 10) === requestedDate
  );
  const latestCheckin = patientCheckins[0] || null;
  const requestedCheckin = dayCheckins[0] || null;

  const formatBloodPressure = (checkin) =>
    checkin?.bloodPressureSys != null && checkin?.bloodPressureDia != null
      ? `${checkin.bloodPressureSys}/${checkin.bloodPressureDia} mmHg`
      : null;

  const periodLabel = q.includes("yesterday") ? "yesterday" : "today";
  const askedForPeriod = q.includes("today") || q.includes("yesterday");
  const checkinValueReply = (label, value, unit = "") =>
    value != null
      ? `Your recorded ${label} for ${periodLabel} is **${value}${unit}**.`
      : `No ${label} reading is recorded for ${periodLabel}.`;

  if (
    (q.includes("heart rate") || q.includes("pulse")) &&
    (patientId ||
      askedForPeriod ||
      q.includes("latest") ||
      q.includes("current") ||
      q.includes("my"))
  ) {
    const targetCheckin = askedForPeriod ? requestedCheckin : latestCheckin;
    return res.json({
      sender: "HealthAssist AI",
      intent: "heart_rate",
      date: targetCheckin?.timestamp?.slice(0, 10) || requestedDate,
      reply:
        targetCheckin?.heartRate != null
          ? `Your recorded heart rate is **${targetCheckin.heartRate} bpm**.`
          : "No heart-rate reading is recorded in your available reports.",
    });
  }

  if (
    (q.includes("blood pressure") || /\bbp\b/.test(q)) &&
    (patientId ||
      askedForPeriod ||
      q.includes("latest") ||
      q.includes("current") ||
      q.includes("my"))
  ) {
    const targetCheckin = askedForPeriod ? requestedCheckin : latestCheckin;
    const value = formatBloodPressure(targetCheckin);
    return res.json({
      sender: "HealthAssist AI",
      intent: "blood_pressure",
      date: targetCheckin?.timestamp?.slice(0, 10) || requestedDate,
      reply: value
        ? `Your recorded blood pressure ${
            askedForPeriod ? `for ${periodLabel}` : "in your latest report"
          } is **${value}**.`
        : `No blood-pressure reading is recorded ${
            askedForPeriod ? `for ${periodLabel}` : "in your available reports"
          }.`,
    });
  }

  if (
    (q.includes("glucose") || q.includes("sugar")) &&
    (patientId ||
      askedForPeriod ||
      q.includes("latest") ||
      q.includes("current") ||
      q.includes("my"))
  ) {
    const targetCheckin = askedForPeriod ? requestedCheckin : latestCheckin;
    return res.json({
      sender: "HealthAssist AI",
      intent: "blood_glucose",
      date: targetCheckin?.timestamp?.slice(0, 10) || requestedDate,
      reply:
        targetCheckin?.bloodGlucose != null
          ? `Your recorded blood glucose is **${targetCheckin.bloodGlucose} mg/dL**.`
          : "No blood-glucose reading is recorded in your available reports.",
    });
  }

  if (
    (q.includes("spo2") ||
      q.includes("oxygen") ||
      q.includes("oxygen level")) &&
    !q.includes("what does") &&
    !q.includes("what is") &&
    !q.includes("mean") &&
    !q.includes("explain") &&
    (patientId ||
      askedForPeriod ||
      q.includes("latest") ||
      q.includes("current") ||
      q.includes("my"))
  ) {
    const targetCheckin = askedForPeriod ? requestedCheckin : latestCheckin;
    return res.json({
      sender: "HealthAssist AI",
      intent: "spo2",
      date: targetCheckin?.timestamp?.slice(0, 10) || requestedDate,
      reply:
        targetCheckin?.spO2 != null
          ? `Your recorded SpO2 is **${targetCheckin.spO2}%**.`
          : "No SpO2 reading is recorded in your available reports.",
    });
  }

  if (
    (q.includes("temperature") || q.includes("fever")) &&
    (askedForPeriod || q.includes("latest") || q.includes("current"))
  ) {
    return res.json({
      sender: "HealthAssist AI",
      intent: "temperature",
      date: requestedDate,
      reply: checkinValueReply(
        "temperature",
        requestedCheckin?.temperature,
        " °C"
      ),
    });
  }

  if (
    (q.includes("weight") || q.includes("weigh")) &&
    (askedForPeriod || q.includes("latest") || q.includes("current"))
  ) {
    return res.json({
      sender: "HealthAssist AI",
      intent: "weight",
      date: requestedDate,
      reply: checkinValueReply("weight", requestedCheckin?.weight, " kg"),
    });
  }

  if (
    q.includes("medication") ||
    q.includes("medicine") ||
    q.includes("pills") ||
    q.includes("prescription")
  ) {
    const medications = patientId
      ? (db.data.medications || []).filter(
          (medication) => medication.patientId === patientId
        )
      : [];
    const medicationText = medications.length
      ? medications
          .map(
            (medication) =>
              `${medication.name} (${medication.dosage}, ${medication.frequency})`
          )
          .join(", ")
      : patient?.currentMedications?.join(", ");
    return res.json({
      sender: "HealthAssist AI",
      intent: "medication",
      reply: medicationText
        ? `Your recorded medications are: **${medicationText}**. Follow the prescribed instructions and do not change a dose without your clinician.`
        : "No medication information is recorded in your authorized patient profile.",
    });
  }

  if (
    q.includes("doctor instruction") ||
    q.includes("discharge instruction") ||
    q.includes("doctor told") ||
    q.includes("care instruction")
  ) {
    return res.json({
      sender: "HealthAssist AI",
      intent: "doctor_instruction",
      reply: patient?.dischargeInstructions
        ? `Your recorded doctor/discharge instructions are: **${patient.dischargeInstructions}**`
        : "No doctor instructions are recorded in your authorized profile. Please contact your care team.",
    });
  }

  if (
    q.includes("follow-up") ||
    q.includes("follow up") ||
    q.includes("appointment") ||
    q.includes("doctor visit")
  ) {
    const followup = patientId
      ? (db.data.followups || [])
          .filter(
            (item) =>
              item.patientId === patientId && item.status !== "completed"
          )
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
      : null;
    return res.json({
      sender: "HealthAssist AI",
      intent: "follow_up",
      reply: followup
        ? `Your next follow-up is **${followup.date} at ${
            followup.time
          }** with ${
            followup.doctorName || patient?.doctorName || "your care team"
          }. Purpose: ${followup.purpose || "recovery review"}.`
        : patient?.followUpDate
        ? `Your recorded follow-up date is **${patient.followUpDate}** with ${
            patient.doctorName || "your care team"
          }.`
        : "No follow-up appointment is recorded in your authorized profile.",
    });
  }

  if (q.includes("why") && (q.includes("blood pressure") || q.includes("bp"))) {
    return res.json({
      sender: "HealthAssist AI",
      intent: "blood_pressure_reason",
      reply:
        "**Why monitor blood pressure?**\n\nRegular readings help your care team compare today's pressure with your personal baseline, identify changes early, and decide whether follow-up is needed. Follow your doctor's instructions and seek urgent care for severe symptoms.",
    });
  }

  if (
    (q.includes("blood pressure") || /\bbp\b/.test(q)) &&
    (q.includes("today") ||
      q.includes("yesterday") ||
      q.includes("latest") ||
      q.includes("current"))
  ) {
    const value = formatBloodPressure(requestedCheckin);
    return res.json({
      sender: "HealthAssist AI",
      intent: "blood_pressure",
      date: requestedDate,
      reply: value
        ? `Your recorded blood pressure for ${
            q.includes("yesterday") ? "yesterday" : "today"
          } is **${value}**.`
        : `No blood-pressure reading is recorded for ${
            q.includes("yesterday") ? "yesterday" : "today"
          }.`,
    });
  }

  if (
    (q.includes("glucose") || q.includes("sugar")) &&
    (patientId ||
      q.includes("today") ||
      q.includes("yesterday") ||
      q.includes("latest") ||
      q.includes("current") ||
      q.includes("my"))
  ) {
    const targetCheckin = askedForPeriod ? requestedCheckin : latestCheckin;
    const value = targetCheckin?.bloodGlucose;
    return res.json({
      sender: "HealthAssist AI",
      intent: "blood_glucose",
      date: targetCheckin?.timestamp?.slice(0, 10) || requestedDate,
      reply:
        value != null
          ? `Your recorded blood glucose ${
              askedForPeriod ? `for ${periodLabel}` : "in your latest report"
            } is **${value} mg/dL**.`
          : `No blood-glucose reading is recorded ${
              askedForPeriod
                ? `for ${periodLabel}`
                : "in your available reports"
            }.`,
    });
  }

  if (
    q.includes("symptom") &&
    (patientId ||
      q.includes("today") ||
      q.includes("yesterday") ||
      q.includes("reported") ||
      q.includes("my"))
  ) {
    const targetCheckin = askedForPeriod ? requestedCheckin : latestCheckin;
    const symptoms = targetCheckin
      ? [
          targetCheckin.dizziness && "dizziness",
          targetCheckin.breathingDifficulty && "breathing difficulty",
          targetCheckin.chestDiscomfort && "chest discomfort",
          targetCheckin.swelling && "swelling",
          targetCheckin.nausea && "nausea",
          targetCheckin.otherSymptoms,
        ].filter(Boolean)
      : [];
    return res.json({
      sender: "HealthAssist AI",
      intent: "symptoms",
      date: targetCheckin?.timestamp?.slice(0, 10) || requestedDate,
      reply: symptoms.length
        ? `Symptoms recorded for ${
            q.includes("yesterday") ? "yesterday" : "today"
          }: **${symptoms.join(", ")}**.`
        : `No symptom report is recorded for ${
            q.includes("yesterday") ? "yesterday" : "today"
          }.`,
    });
  }

  if (
    q.includes("risk") &&
    (q.includes("current") || q.includes("status") || q.includes("today"))
  ) {
    return res.json({
      sender: "HealthAssist AI",
      intent: "risk_status",
      reply: patient
        ? `Your current recorded risk status is **${
            patient.currentRiskLevel || "Unavailable"
          }**${
            patient.riskScore != null ? ` (score ${patient.riskScore})` : ""
          }. This is decision-support information, not a diagnosis.`
        : "A patient risk status is unavailable because no authorized patient context was provided.",
    });
  }

  if (
    q.includes("next report") ||
    q.includes("next check") ||
    q.includes("monitoring schedule")
  ) {
    return res.json({
      sender: "HealthAssist AI",
      intent: "monitoring_schedule",
      reply: db.data.monitoringSchedules?.[patientId]?.monitoring_plan?.length
        ? `Your monitoring schedule includes: **${db.data.monitoringSchedules[
            patientId
          ].monitoring_plan
            .map((item) => `${item.time}: ${item.parameter}`)
            .join("; ")}**.`
        : "Your personalized monitoring schedule is not available in the current record. Please follow your doctor's written instructions or contact your care team.",
    });
  }

  // 2. Medical Terms Explanation
  if (
    q.includes("spo2") ||
    q.includes("oxygen saturation") ||
    q.includes("pulse ox")
  ) {
    return res.json({
      sender: "HealthAssist AI",
      reply: `**SpO2 (Blood Oxygen Saturation):**\n\nSpO2 refers to blood oxygen saturation. It indicates the percentage of oxygen carried by the hemoglobin in your red blood cells.\n\n• **Normal Range:** Typically 95% to 100% for most healthy individuals.\n• **Target for Post-Acute Recovery:** Generally ≥ 94% unless your doctor has specified a different baseline for chronic lung conditions.\n• **What to do:** If your SpO2 drops below 92%, sit upright, breathe slowly and deeply, and contact your care team immediately.`,
      relatedTopics: [
        "How to use a pulse oximeter",
        "Heart Rate vs SpO2",
        "Respiratory Rate",
      ],
    });
  }

  if (
    q.includes("peak flow") ||
    q.includes("flow meter") ||
    q.includes("pefr")
  ) {
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Peak Expiratory Flow (Peak Flow):**\n\nPeak flow measures how fast you can blow air out of your lungs when you exhale with maximum effort. It is an essential indicator of airway narrowing for asthma recovery.\n\n• **Green Zone (80–100% of baseline):** Good asthma control; proceed with usual medications.\n• **Yellow Zone (50–80% of baseline):** Caution; airways are narrowing; follow your physician's Asthma Action Plan.\n• **Red Zone (< 50% of baseline):** Medical alert; use rescue inhaler immediately and seek urgent medical care.`,
      relatedTopics: ["Asthma daily check-in", "Inhaler adherence", "SpO2"],
    });
  }

  if (
    q.includes("blood pressure") ||
    q.includes("systolic") ||
    q.includes("diastolic") ||
    q.includes("hypertension")
  ) {
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Blood Pressure Explained:**\n\nBlood pressure is recorded as two numbers (e.g., 120/80 mmHg):\n\n• **Systolic (top number):** The pressure in your arteries when your heart beats.\n• **Diastolic (bottom number):** The pressure in your arteries when your heart rests between beats.\n• **Post-Discharge Targets:** For hypertension recovery, doctors typically aim for < 130/80 mmHg, but your personalized baseline may differ. Sustained readings ≥ 160/100 mmHg warrant immediate care team review.`,
      relatedTopics: [
        "Low sodium diet tips",
        "When to take blood pressure",
        "Hypertension medications",
      ],
    });
  }

  if (q.includes("glucose") || q.includes("sugar") || q.includes("diabetes")) {
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Blood Glucose in Post-Hospitalization:**\n\nBlood glucose measures the concentration of sugar in your bloodstream.\n\n• **Fasting Target:** Often 80–130 mg/dL for recovery patients.\n• **Post-Meal Target (1-2 hours after meal):** Generally < 180 mg/dL.\n• **Warning Signs:** Hypoglycemia (< 70 mg/dL) can cause shakiness, sweating, or confusion; take 15g fast-acting carbs and notify your care team if unresolved.`,
      relatedTopics: ["Meal logging", "Insulin schedule", "Diabetic symptoms"],
    });
  }

  if (q.includes("ckd") || q.includes("kidney") || q.includes("urine")) {
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Kidney Recovery & Fluid Monitoring:**\n\nFor Chronic Kidney Disease (CKD) and post-acute renal recovery, maintaining fluid balance is critical:\n\n• **Urine Changes:** Monitor for decreased output (< 800mL/day), dark color, or persistent foaminess.\n• **Weight Tracking:** Sudden weight gain (≥ 2-3 lbs in 24 hours) often reflects fluid retention rather than body mass.\n• **Medications:** Strictly avoid NSAIDs (like ibuprofen/naproxen) unless authorized by your nephrologist.`,
      relatedTopics: [
        "Weight check-in",
        "Fluid restriction",
        "Renal lab tests",
      ],
    });
  }

  // 3. Medication Reminders & Adherence
  if (
    q.includes("medication") ||
    q.includes("pills") ||
    q.includes("dose") ||
    q.includes("missed pill")
  ) {
    const medList =
      patient?.currentMedications?.join(", ") || "your prescribed medications";
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Medication Guidance:**\n\nBased on your record, you are currently prescribed:\n**${medList}**\n\n• **If you missed a dose:** Do not double up on your next dose unless instructed by your physician. Log it as "Missed" or "Skipped" in the Medications tab with the reason.\n• **Adherence Alert:** Consecutive missed doses will automatically alert your clinical care team for review.\n• **Always consult:** Never stop cardiovascular, respiratory, or immunosuppressive medications abruptly.`,
      relatedTopics: [
        "View Medications Tab",
        "Log Medication Dose",
        "Prescription details",
      ],
    });
  }

  // 4. Daily Check-in & Baseline Comparison Guidance
  if (
    q.includes("check-in") ||
    q.includes("check in") ||
    q.includes("how to report") ||
    q.includes("readings")
  ) {
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Daily Check-In Guidance:**\n\n1. Navigate to the **Daily Check-In** tab once or twice daily at consistent times.\n2. You can submit data via **Manual Entry**, or tap **Simulate Connected Device** if using Bluetooth telemetry sensors.\n3. Enter your current vitals (Heart Rate, Blood Pressure, SpO2, and disease-specific metrics like Blood Glucose or Peak Flow).\n4. Record your subjective energy, pain, and fatigue levels.\n5. The system will compare your inputs against your personal baseline and generate an instant AI Risk Prediction.`,
      relatedTopics: [
        "Go to Daily Check-In",
        "View Baseline Range",
        "Recent Trends",
      ],
    });
  }

  // 5. Explaining Alerts & Risk Level
  if (
    q.includes("alert") ||
    q.includes("risk level") ||
    q.includes("warning")
  ) {
    const pRisk = patient?.currentRiskLevel || "Moderate Risk";
    const pTrend = patient?.riskTrend || "Stable";
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Understanding Your Health Status:**\n\n• **Current Risk Tier:** ${pRisk}\n• **Trajectory Trend:** ${pTrend}\n\nOur Explainable AI evaluates 12 parameters (vital deviations from your personal baseline, reported symptom combinations, and medication adherence). An alert is sent to your doctor if vitals cross clinical thresholds, enabling proactive care before a complication arises.`,
      relatedTopics: [
        "Explainable AI Factors",
        "Contact Care Team",
        "Recent Vitals",
      ],
    });
  }

  // 6. Follow-up Reminders
  if (
    q.includes("follow-up") ||
    q.includes("appointment") ||
    q.includes("doctor visit")
  ) {
    const fDate = patient?.followUpDate || "in 5 days";
    const doc = patient?.doctorName || "your attending physician";
    return res.json({
      sender: "HealthAssist AI",
      reply: `**Upcoming Clinical Follow-Up:**\n\n• **Scheduled Date:** ${fDate}\n• **Provider:** ${doc}\n• **Preparation:** Please record your daily check-in vitals leading up to your visit. Bring your current medication list and any questions about your recovery progress.`,
      relatedTopics: [
        "Follow-Up Manager",
        "Care Team Messaging",
        "Discharge Instructions",
      ],
    });
  }

  let topicReply =
    "I can help with your recorded vitals, symptoms, medications, risk status, monitoring schedule, doctor instructions, or general health terms. Please ask a specific question.";
  if (q.includes("what is") || q.includes("explain") || q.includes("mean")) {
    topicReply =
      "I can explain that health term in general. Please name the measurement or symptom, such as SpO2, blood pressure, heart rate, glucose, or peak flow.";
  } else if (
    q.includes("report") ||
    q.includes("check-in") ||
    q.includes("check in")
  ) {
    topicReply = patientId
      ? "Your check-in is submitted from the Daily Check-In page. I can also look up a recorded vital, symptom, risk result, or medication from your authorized profile."
      : "Please sign in as a patient so I can use your authorized check-in records.";
  } else if (q.includes("help") || q.includes("hello") || q.includes("hi")) {
    topicReply =
      "Hello. I can answer questions about your recorded health data, medications, symptoms, risk status, schedule, and doctor instructions. Different questions are matched to different records.";
  }

  return res.json({
    sender: "HealthAssist AI",
    intent: "general_health_question",
    reply: `${topicReply}\n\nI provide monitoring support only. I do not diagnose conditions, prescribe medication, or change doses. Call emergency services for severe symptoms.`,
    quickSuggestions: [
      "What does SpO2 mean?",
      "What does Peak Flow mean?",
      "Explain my blood pressure numbers",
      "What should I do if I missed my medication?",
      "How does the AI calculate my recovery progress?",
    ],
  });
});

export default router;
