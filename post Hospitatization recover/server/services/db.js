import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateSyntheticDataset } from "./synthetic_dataset_generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/store.json");

export const defaultAgeGroupConfig = {
  children: { id: "children", name: "Children / Adolescents", min: 0, max: 17 },
  youngAdults: { id: "youngAdults", name: "Young Adults", min: 18, max: 35 },
  middleAged: {
    id: "middleAged",
    name: "Middle-Aged Adults",
    min: 36,
    max: 55,
  },
  olderAdults: { id: "olderAdults", name: "Older Adults", min: 56, max: 70 },
  elderly: { id: "elderly", name: "Elderly", min: 71, max: 120 },
};

// Default initial seed data with rich, realistic, clinically coherent profiles
const createInitialSeed = () => {
  const now = new Date();
  const subHours = (h) =>
    new Date(now.getTime() - h * 3600 * 1000).toISOString();
  const subDays = (d) =>
    new Date(now.getTime() - d * 86400 * 1000).toISOString();
  const addDays = (d) =>
    new Date(now.getTime() + d * 86400 * 1000).toISOString();

  const patients = [
    {
      id: "PMR-2026-0101",
      name: "Robert Vance",
      age: 68,
      gender: "Male",
      phone: "+1 (555) 234-8901",
      email: "robert.vance@example.com",
      password: "patient123",
      address: "742 Evergreen Terrace, Springfield, IL",
      emergencyContactName: "Eleanor Vance (Wife)",
      emergencyContactPhone: "+1 (555) 234-8902",
      bloodGroup: "A+",
      existingConditions: [
        "Coronary Artery Disease",
        "Hypertension",
        "Hyperlipidemia",
      ],
      allergies: ["Penicillin", "Sulfa Drugs"],
      currentMedications: [
        "Metoprolol 50mg",
        "Atorvastatin 40mg",
        "Aspirin 81mg",
        "Apixaban 5mg",
      ],
      medicalHistory: "Prior myocardial infarction (2021). Mild COPD.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Sarah Jenkins, MD",
      doctorId: "DOC-101",
      admissionDate: subDays(10).split("T")[0],
      dischargeDate: subDays(4).split("T")[0],
      hospitalizationReason: "Unstable Angina leading to triple vessel disease",
      diagnosis: "Coronary Artery Bypass Graft (CABG) x3",
      dischargeInstructions:
        "Daily sternal incision inspection. Strict fluid monitoring. Take anticoagulant with morning meal. No lifting > 5 lbs.",
      followUpDate: addDays(3).split("T")[0],
      recoveryStatus: "Guarded - Active Alert",
      currentRiskLevel: "High Risk",
      riskScore: 78,
    },
    {
      id: "PMR-2026-0102",
      name: "Elena Rostova",
      age: 54,
      gender: "Female",
      phone: "+1 (555) 345-9012",
      email: "elena.rostova@example.com",
      password: "patient123",
      address: "128 Beacon Street, Boston, MA",
      emergencyContactName: "Dmitri Rostov (Son)",
      emergencyContactPhone: "+1 (555) 345-9015",
      bloodGroup: "O+",
      existingConditions: ["Asthma", "Mild Osteoarthritis"],
      allergies: ["Latex"],
      currentMedications: [
        "Azithromycin 250mg",
        "Albuterol Inhaler PRN",
        "Prednisone 10mg (Taper)",
      ],
      medicalHistory: "Childhood asthma. No previous ICU admissions.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Alex Rivera, MD",
      doctorId: "DOC-102",
      admissionDate: subDays(8).split("T")[0],
      dischargeDate: subDays(3).split("T")[0],
      hospitalizationReason:
        "Hypoxemic respiratory failure secondary to bacterial pneumonia",
      diagnosis: "Severe Community-Acquired Pneumonia (Resolving)",
      dischargeInstructions:
        "Complete 7-day antibiotic course. Practice incentive spirometry 10x per waking hour. Record SpO2 morning and night.",
      followUpDate: addDays(4).split("T")[0],
      recoveryStatus: "Improving with Caution",
      currentRiskLevel: "Moderate Risk",
      riskScore: 48,
    },
    {
      id: "PMR-2026-0103",
      name: "Marcus Thorne",
      age: 72,
      gender: "Male",
      phone: "+1 (555) 456-0123",
      email: "marcus.thorne@example.com",
      password: "patient123",
      address: "405 Pine Valley Way, Austin, TX",
      emergencyContactName: "Clara Thorne (Daughter)",
      emergencyContactPhone: "+1 (555) 456-0129",
      bloodGroup: "B+",
      existingConditions: [
        "Congestive Heart Failure (NYHA III)",
        "Type 2 Diabetes",
        "Chronic Kidney Disease Stage 3",
      ],
      allergies: ["None known"],
      currentMedications: [
        "Furosemide 40mg BID",
        "Carvedilol 12.5mg BID",
        "Empagliflozin 10mg",
        "Lisinopril 10mg",
      ],
      medicalHistory:
        "Ischemic cardiomyopathy (LVEF 32%). Pacemaker implanted 2023.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Sarah Jenkins, MD",
      doctorId: "DOC-101",
      admissionDate: subDays(14).split("T")[0],
      dischargeDate: subDays(5).split("T")[0],
      hospitalizationReason:
        "Acute decompensated heart failure with bilateral pulmonary edema",
      diagnosis: "Acute on Chronic Heart Failure Exacerbation",
      dischargeInstructions:
        "Weigh daily before breakfast on same scale. Report weight gain >= 3 lbs in 24 hrs. Limit sodium < 1,500 mg/day.",
      followUpDate: addDays(2).split("T")[0],
      recoveryStatus: "High Alert - Fluid Retention",
      currentRiskLevel: "High Risk",
      riskScore: 84,
    },
    {
      id: "PMR-2026-0104",
      name: "Chloe Bennett",
      age: 36,
      gender: "Female",
      phone: "+1 (555) 567-1234",
      email: "chloe.bennett@example.com",
      password: "patient123",
      address: "88 Harbor Drive, Seattle, WA",
      emergencyContactName: "Liam Bennett (Spouse)",
      emergencyContactPhone: "+1 (555) 567-1236",
      bloodGroup: "A-",
      existingConditions: ["None"],
      allergies: ["Codeine"],
      currentMedications: ["Ibuprofen 400mg PRN", "Acetaminophen 500mg"],
      medicalHistory: "Biliary colic. Otherwise healthy active lifestyle.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Sarah Jenkins, MD",
      doctorId: "DOC-101",
      admissionDate: subDays(4).split("T")[0],
      dischargeDate: subDays(2).split("T")[0],
      hospitalizationReason: "Symptomatic cholelithiasis",
      diagnosis: "Acute Cholecystitis s/p Laparoscopic Cholecystectomy",
      dischargeInstructions:
        "Low-fat diet for 2 weeks. Keep port incisions dry. Normal ambulation encouraged. Follow-up in 10 days.",
      followUpDate: addDays(8).split("T")[0],
      recoveryStatus: "Normal Recovery",
      currentRiskLevel: "Low Risk",
      riskScore: 14,
    },
    {
      id: "PMR-2026-0105",
      name: "David O'Connor",
      age: 48,
      gender: "Male",
      phone: "+1 (555) 678-2345",
      email: "david.oconnor@example.com",
      password: "patient123",
      address: "921 Elmwood Road, Denver, CO",
      emergencyContactName: "Patricia O'Connor (Sister)",
      emergencyContactPhone: "+1 (555) 678-2349",
      bloodGroup: "AB+",
      existingConditions: ["Type 1 Diabetes Mellitus", "Peripheral Neuropathy"],
      allergies: ["Ciprofloxacin"],
      currentMedications: [
        "Insulin Glargine 24 units QPM",
        "Insulin Lispro with meals",
        "Gabapentin 300mg TID",
      ],
      medicalHistory:
        "T1D diagnosed age 14. Prior episodes of ketoacidosis during acute viral illness.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Alex Rivera, MD",
      doctorId: "DOC-102",
      admissionDate: subDays(7).split("T")[0],
      dischargeDate: subDays(3).split("T")[0],
      hospitalizationReason:
        "Diabetic Ketoacidosis precipitated by gastroenteritis",
      diagnosis: "Resolved Diabetic Ketoacidosis (DKA)",
      dischargeInstructions:
        "Check blood glucose minimum 4x/day. Check urine ketones if BG > 250 mg/dL. Maintain generous fluid intake.",
      followUpDate: addDays(5).split("T")[0],
      recoveryStatus: "Moderate Risk - Glycemic Watch",
      currentRiskLevel: "Moderate Risk",
      riskScore: 56,
    },
    {
      id: "PMR-2026-0106",
      name: "Amina Al-Mansoor",
      age: 61,
      gender: "Female",
      phone: "+1 (555) 789-3456",
      email: "amina.almansoor@example.com",
      password: "patient123",
      address: "15 Oak Ridge Blvd, Raleigh, NC",
      emergencyContactName: "Tariq Al-Mansoor (Husband)",
      emergencyContactPhone: "+1 (555) 789-3458",
      bloodGroup: "O-",
      existingConditions: [
        "Osteoarthritis (Severe bilateral)",
        "Hypothyroidism",
      ],
      allergies: ["Aspirin"],
      currentMedications: [
        "Levothyroxine 75mcg",
        "Enoxaparin 40mg SubQ daily",
        "Tramadol 50mg PRN",
      ],
      medicalHistory: "Prior right hip arthroplasty (2019).",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Sarah Jenkins, MD",
      doctorId: "DOC-101",
      admissionDate: subDays(6).split("T")[0],
      dischargeDate: subDays(3).split("T")[0],
      hospitalizationReason:
        "End-stage left knee tricompartmental osteoarthritis",
      diagnosis: "Elective Left Total Knee Arthroplasty (TKA)",
      dischargeInstructions:
        "Perform physical therapy quadriceps sets 3x daily. Wear compression stockings. Monitor calf for tenderness or warmth.",
      followUpDate: addDays(6).split("T")[0],
      recoveryStatus: "Normal Recovery",
      currentRiskLevel: "Low Risk",
      riskScore: 19,
    },
    {
      id: "PMR-2026-0107",
      name: "Samuel Jackson",
      age: 77,
      gender: "Male",
      phone: "+1 (555) 890-4567",
      email: "samuel.jackson@example.com",
      password: "patient123",
      address: "312 Magnolia Lane, Atlanta, GA",
      emergencyContactName: "Cynthia Jackson (Wife)",
      emergencyContactPhone: "+1 (555) 890-4569",
      bloodGroup: "A+",
      existingConditions: [
        "Benign Prostatic Hyperplasia",
        "Atrial Fibrillation",
        "Mild Cognitive Impairment",
      ],
      allergies: ["Cephalosporins"],
      currentMedications: [
        "Cefdinir 300mg oral BID",
        "Warfarin 4mg",
        "Tamsulosin 0.4mg",
        "Metoprolol 25mg",
      ],
      medicalHistory:
        "Recurrent UTIs. Pacemaker placed 2018 for sick sinus syndrome.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Alex Rivera, MD",
      doctorId: "DOC-102",
      admissionDate: subDays(12).split("T")[0],
      dischargeDate: subDays(4).split("T")[0],
      hospitalizationReason: "Urosepsis with acute kidney injury stage 2",
      diagnosis: "Severe Urosepsis, resolving AKI",
      dischargeInstructions:
        "Strict antibiotic adherence to finish 14-day course. Track temperature twice daily. Report confusion or chills immediately.",
      followUpDate: addDays(1).split("T")[0],
      recoveryStatus: "High Alert - Sepsis Surveillance",
      currentRiskLevel: "High Risk",
      riskScore: 81,
    },
    {
      id: "PMR-2026-0108",
      name: "Grace Kim",
      age: 42,
      gender: "Female",
      phone: "+1 (555) 901-5678",
      email: "grace.kim@example.com",
      password: "patient123",
      address: "65 Willow Brook Court, San Jose, CA",
      emergencyContactName: "Daniel Kim (Brother)",
      emergencyContactPhone: "+1 (555) 901-5680",
      bloodGroup: "B-",
      existingConditions: ["None"],
      allergies: ["None known"],
      currentMedications: ["Acetaminophen 500mg PRN", "Colace 100mg"],
      medicalHistory: "No major surgical or medical history.",
      hospitalName: "St. Jude Metropolitan Hospital",
      doctorName: "Dr. Sarah Jenkins, MD",
      doctorId: "DOC-101",
      admissionDate: subDays(5).split("T")[0],
      dischargeDate: subDays(3).split("T")[0],
      hospitalizationReason: "Acute suppurative appendicitis",
      diagnosis: "Laparoscopic Appendectomy",
      dischargeInstructions:
        "Light walking. Avoid heavy exertion for 10 days. Clean incision with mild soap and water.",
      followUpDate: addDays(11).split("T")[0],
      recoveryStatus: "Normal Recovery",
      currentRiskLevel: "Low Risk",
      riskScore: 12,
    },
  ];

  const doctors = [
    {
      id: "DOC-101",
      name: "Dr. Sarah Jenkins, MD",
      role: "Lead Post-Acute Care & Cardiologist",
      department: "Cardiology & Surgical Step-Down",
      hospital: "St. Jude Metropolitan Hospital",
      email: "dr.jenkins@stjude-health.org",
      password: "doctor123",
      phone: "+1 (555) 990-1001",
    },
    {
      id: "DOC-102",
      name: "Dr. Alex Rivera, MD",
      role: "Attending Pulmonologist & Critical Care",
      department: "Pulmonary Medicine & Post-ICU Care",
      hospital: "St. Jude Metropolitan Hospital",
      email: "dr.rivera@stjude-health.org",
      password: "doctor123",
      phone: "+1 (555) 990-1002",
    },
    {
      id: "DOC-103",
      name: "Dr. Rachel Chen, MD",
      role: "Attending Endocrinologist",
      department: "Metabolic Recovery Care",
      hospital: "St. Jude Metropolitan Hospital",
      email: "dr.chen@stjude-health.org",
      password: "doctor123",
      phone: "+1 (555) 990-1003",
    },
    {
      id: "DOC-104",
      name: "Dr. Marcus Sterling, MD",
      role: "Attending Nephrologist",
      department: "Renal Recovery Care",
      hospital: "St. Jude Metropolitan Hospital",
      email: "dr.sterling@stjude-health.org",
      password: "doctor123",
      phone: "+1 (555) 990-1004",
    },
    {
      id: "DOC-105",
      name: "Dr. Priya Nair, MD",
      role: "Attending Recovery Physician",
      department: "General Post-Acute Care",
      hospital: "St. Jude Metropolitan Hospital",
      email: "dr.nair@stjude-health.org",
      password: "doctor123",
      phone: "+1 (555) 990-1005",
    },
    {
      id: "ADM-201",
      name: "Clara Martinez, RN BSN",
      role: "Clinical Nurse Coordinator & Administrator",
      department: "Post-Discharge Care Management",
      hospital: "St. Jude Metropolitan Hospital",
      email: "admin@stjude-health.org",
      password: "admin123",
      phone: "+1 (555) 990-2001",
    },
  ];

  // Longitudinal vitals & checkins for demo patients
  const checkins = [
    // Robert Vance - High Risk deteriorating trend
    {
      id: "CHK-0101-1",
      patientId: "PMR-2026-0101",
      timestamp: subDays(3),
      heartRate: 78,
      spO2: 97,
      temperature: 36.8,
      bloodPressureSys: 124,
      bloodPressureDia: 78,
      respiratoryRate: 16,
      bloodGlucose: 115,
      painLevel: 3,
      fatigueLevel: 4,
      sleepQuality: "Good",
      appetite: "Normal",
      dizziness: false,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: false,
      nausea: false,
      otherSymptoms: "Mild soreness near sternum.",
      notes: "Feeling relatively stable today after first day home.",
      measurementMode: "device",
      riskScore: 24,
      riskLevel: "Low Risk",
    },
    {
      id: "CHK-0101-2",
      patientId: "PMR-2026-0101",
      timestamp: subDays(2),
      heartRate: 88,
      spO2: 95,
      temperature: 37.2,
      bloodPressureSys: 136,
      bloodPressureDia: 84,
      respiratoryRate: 18,
      bloodGlucose: 128,
      painLevel: 5,
      fatigueLevel: 6,
      sleepQuality: "Fair",
      appetite: "Normal",
      dizziness: true,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: false,
      nausea: false,
      otherSymptoms: "Slight lightheadedness when standing up.",
      notes: "Felt a bit tired in the afternoon.",
      measurementMode: "device",
      riskScore: 42,
      riskLevel: "Moderate Risk",
    },
    {
      id: "CHK-0101-3",
      patientId: "PMR-2026-0101",
      timestamp: subDays(1),
      heartRate: 98,
      spO2: 93,
      temperature: 37.8,
      bloodPressureSys: 148,
      bloodPressureDia: 92,
      respiratoryRate: 21,
      bloodGlucose: 142,
      painLevel: 6,
      fatigueLevel: 8,
      sleepQuality: "Poor",
      appetite: "Poor",
      dizziness: true,
      breathingDifficulty: true,
      chestDiscomfort: true,
      swelling: true,
      nausea: false,
      otherSymptoms: "Sternal pressure when taking deep breath, ankles puffy.",
      notes: "Breathing felt tighter walking up hallway.",
      measurementMode: "manual",
      riskScore: 72,
      riskLevel: "High Risk",
    },
    {
      id: "CHK-0101-4",
      patientId: "PMR-2026-0101",
      timestamp: subHours(4),
      heartRate: 108,
      spO2: 91,
      temperature: 38.1,
      bloodPressureSys: 154,
      bloodPressureDia: 96,
      respiratoryRate: 24,
      bloodGlucose: 148,
      painLevel: 7,
      fatigueLevel: 9,
      sleepQuality: "Poor",
      appetite: "Poor",
      dizziness: true,
      breathingDifficulty: true,
      chestDiscomfort: true,
      swelling: true,
      nausea: true,
      otherSymptoms: "Tightness across chest and bilateral lower leg edema.",
      notes: "Severe fatigue. Trouble catching breath even at rest.",
      measurementMode: "device",
      riskScore: 86,
      riskLevel: "High Risk",
    },

    // Elena Rostova - Moderate Risk pneumonia recovery
    {
      id: "CHK-0102-1",
      patientId: "PMR-2026-0102",
      timestamp: subDays(2),
      heartRate: 86,
      spO2: 92,
      temperature: 37.9,
      bloodPressureSys: 128,
      bloodPressureDia: 80,
      respiratoryRate: 22,
      bloodGlucose: 104,
      painLevel: 4,
      fatigueLevel: 7,
      sleepQuality: "Fair",
      appetite: "Poor",
      dizziness: false,
      breathingDifficulty: true,
      chestDiscomfort: false,
      swelling: false,
      nausea: false,
      otherSymptoms: "Persistent cough with thick sputum.",
      notes: "Coughing spells especially in morning.",
      measurementMode: "manual",
      riskScore: 58,
      riskLevel: "Moderate Risk",
    },
    {
      id: "CHK-0102-2",
      patientId: "PMR-2026-0102",
      timestamp: subHours(6),
      heartRate: 82,
      spO2: 94,
      temperature: 37.3,
      bloodPressureSys: 122,
      bloodPressureDia: 76,
      respiratoryRate: 19,
      bloodGlucose: 98,
      painLevel: 3,
      fatigueLevel: 5,
      sleepQuality: "Fair",
      appetite: "Normal",
      dizziness: false,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: false,
      nausea: false,
      otherSymptoms: "Mild dry cough remaining.",
      notes: "Using spirometer as prescribed. Sputum clearing up.",
      measurementMode: "device",
      riskScore: 42,
      riskLevel: "Moderate Risk",
    },

    // Marcus Thorne - Heart Failure watch
    {
      id: "CHK-0103-1",
      patientId: "PMR-2026-0103",
      timestamp: subDays(2),
      heartRate: 76,
      spO2: 94,
      temperature: 36.6,
      bloodPressureSys: 138,
      bloodPressureDia: 86,
      respiratoryRate: 18,
      bloodGlucose: 154,
      painLevel: 2,
      fatigueLevel: 6,
      sleepQuality: "Fair",
      appetite: "Normal",
      dizziness: false,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: true,
      nausea: false,
      otherSymptoms: "Mild 1+ pedal edema.",
      notes: "Weight 184 lbs.",
      measurementMode: "device",
      riskScore: 52,
      riskLevel: "Moderate Risk",
    },
    {
      id: "CHK-0103-2",
      patientId: "PMR-2026-0103",
      timestamp: subHours(5),
      heartRate: 94,
      spO2: 91,
      temperature: 36.7,
      bloodPressureSys: 148,
      bloodPressureDia: 92,
      respiratoryRate: 22,
      bloodGlucose: 168,
      painLevel: 3,
      fatigueLevel: 8,
      sleepQuality: "Poor",
      appetite: "Poor",
      dizziness: true,
      breathingDifficulty: true,
      chestDiscomfort: false,
      swelling: true,
      nausea: false,
      otherSymptoms: "2+ bilateral pitting edema up to mid-shin.",
      notes: "Weight 188 lbs (+4 lbs in 48 hrs!). Needed 3 pillows to sleep.",
      measurementMode: "device",
      riskScore: 84,
      riskLevel: "High Risk",
    },

    // Chloe Bennett - Low Risk Cholecystectomy
    {
      id: "CHK-0104-1",
      patientId: "PMR-2026-0104",
      timestamp: subDays(1),
      heartRate: 72,
      spO2: 99,
      temperature: 36.6,
      bloodPressureSys: 116,
      bloodPressureDia: 74,
      respiratoryRate: 15,
      bloodGlucose: 92,
      painLevel: 3,
      fatigueLevel: 3,
      sleepQuality: "Good",
      appetite: "Normal",
      dizziness: false,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: false,
      nausea: false,
      otherSymptoms: "Mild incision tenderness only.",
      notes: "Able to walk around garden without discomfort.",
      measurementMode: "manual",
      riskScore: 12,
      riskLevel: "Low Risk",
    },
    {
      id: "CHK-0104-2",
      patientId: "PMR-2026-0104",
      timestamp: subHours(7),
      heartRate: 70,
      spO2: 99,
      temperature: 36.5,
      bloodPressureSys: 114,
      bloodPressureDia: 72,
      respiratoryRate: 14,
      bloodGlucose: 90,
      painLevel: 1,
      fatigueLevel: 2,
      sleepQuality: "Excellent",
      appetite: "Good",
      dizziness: false,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: false,
      nausea: false,
      otherSymptoms: "None.",
      notes: "Tolerating low-fat meals well.",
      measurementMode: "device",
      riskScore: 8,
      riskLevel: "Low Risk",
    },

    // Samuel Jackson - High Risk Urosepsis
    {
      id: "CHK-0107-1",
      patientId: "PMR-2026-0107",
      timestamp: subHours(8),
      heartRate: 104,
      spO2: 93,
      temperature: 38.4,
      bloodPressureSys: 96,
      bloodPressureDia: 58,
      respiratoryRate: 23,
      bloodGlucose: 130,
      painLevel: 5,
      fatigueLevel: 9,
      sleepQuality: "Poor",
      appetite: "Poor",
      dizziness: true,
      breathingDifficulty: false,
      chestDiscomfort: false,
      swelling: false,
      nausea: true,
      otherSymptoms: "Shaking chills and flank tenderness.",
      notes: "Feeling warm and unsteady when getting out of bed.",
      measurementMode: "device",
      riskScore: 82,
      riskLevel: "High Risk",
    },
  ];

  // Prescribed medications & schedules
  const medications = [
    // Robert Vance
    {
      id: "MED-0101-1",
      patientId: "PMR-2026-0101",
      name: "Metoprolol Succinate",
      dosage: "50mg",
      frequency: "Once daily (Morning)",
      timeSlots: ["08:00"],
      startDate: subDays(10).split("T")[0],
      endDate: addDays(80).split("T")[0],
      instructions:
        "Take with or immediately after morning meal to control heart rate and blood pressure.",
      critical: true,
      logs: [
        { date: subDays(2).split("T")[0], time: "08:15", status: "taken" },
        { date: subDays(1).split("T")[0], time: "08:30", status: "taken" },
        {
          date: now.toISOString().split("T")[0],
          time: "11:00",
          status: "missed",
          reason: "Patient forgot due to severe fatigue",
        },
      ],
    },
    {
      id: "MED-0101-2",
      patientId: "PMR-2026-0101",
      name: "Apixaban (Eliquis)",
      dosage: "5mg",
      frequency: "Twice daily (Morning & Evening)",
      timeSlots: ["08:00", "20:00"],
      startDate: subDays(10).split("T")[0],
      endDate: addDays(60).split("T")[0],
      instructions: "Anticoagulant. Do not skip. Take exactly 12 hours apart.",
      critical: true,
      logs: [
        { date: subDays(2).split("T")[0], time: "08:15", status: "taken" },
        { date: subDays(2).split("T")[0], time: "20:10", status: "taken" },
        { date: subDays(1).split("T")[0], time: "08:20", status: "taken" },
        {
          date: subDays(1).split("T")[0],
          time: "20:00",
          status: "missed",
          reason: "Fell asleep early",
        },
        {
          date: now.toISOString().split("T")[0],
          time: "08:00",
          status: "missed",
          reason: "Nausea",
        },
      ],
    },
    {
      id: "MED-0101-3",
      patientId: "PMR-2026-0101",
      name: "Atorvastatin",
      dosage: "40mg",
      frequency: "Once daily (Bedtime)",
      timeSlots: ["21:00"],
      startDate: subDays(10).split("T")[0],
      endDate: addDays(180).split("T")[0],
      instructions: "Take at bedtime.",
      critical: false,
      logs: [
        { date: subDays(2).split("T")[0], time: "21:00", status: "taken" },
        { date: subDays(1).split("T")[0], time: "21:00", status: "taken" },
      ],
    },

    // Elena Rostova
    {
      id: "MED-0102-1",
      patientId: "PMR-2026-0102",
      name: "Azithromycin",
      dosage: "250mg",
      frequency: "Once daily",
      timeSlots: ["09:00"],
      startDate: subDays(3).split("T")[0],
      endDate: addDays(4).split("T")[0],
      instructions: "Finish full course even if breathing improves.",
      critical: true,
      logs: [
        { date: subDays(2).split("T")[0], time: "09:05", status: "taken" },
        { date: subDays(1).split("T")[0], time: "09:00", status: "taken" },
        {
          date: now.toISOString().split("T")[0],
          time: "09:15",
          status: "taken",
        },
      ],
    },
    {
      id: "MED-0102-2",
      patientId: "PMR-2026-0102",
      name: "Prednisone",
      dosage: "10mg (Tapering)",
      frequency: "Once daily (Morning)",
      timeSlots: ["08:00"],
      startDate: subDays(3).split("T")[0],
      endDate: addDays(2).split("T")[0],
      instructions: "Take with food.",
      critical: false,
      logs: [
        { date: subDays(2).split("T")[0], time: "08:30", status: "taken" },
        { date: subDays(1).split("T")[0], time: "08:15", status: "taken" },
        {
          date: now.toISOString().split("T")[0],
          time: "08:00",
          status: "taken",
        },
      ],
    },

    // Marcus Thorne
    {
      id: "MED-0103-1",
      patientId: "PMR-2026-0103",
      name: "Furosemide (Lasix)",
      dosage: "40mg",
      frequency: "Twice daily (08:00 & 14:00)",
      timeSlots: ["08:00", "14:00"],
      startDate: subDays(5).split("T")[0],
      endDate: addDays(90).split("T")[0],
      instructions:
        "Diuretic for fluid overload. Do not take late in evening to avoid nocturia.",
      critical: true,
      logs: [
        { date: subDays(2).split("T")[0], time: "08:00", status: "taken" },
        { date: subDays(2).split("T")[0], time: "14:00", status: "taken" },
        { date: subDays(1).split("T")[0], time: "08:00", status: "taken" },
        {
          date: subDays(1).split("T")[0],
          time: "14:00",
          status: "skipped",
          reason: "Patient had outing",
        },
        {
          date: now.toISOString().split("T")[0],
          time: "08:00",
          status: "missed",
          reason: "Ran out of pills",
        },
      ],
    },

    // Chloe Bennett
    {
      id: "MED-0104-1",
      patientId: "PMR-2026-0104",
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "Every 6-8 hours PRN",
      timeSlots: ["12:00"],
      startDate: subDays(2).split("T")[0],
      endDate: addDays(5).split("T")[0],
      instructions: "Take with food only as needed for surgical site soreness.",
      critical: false,
      logs: [
        { date: subDays(1).split("T")[0], time: "12:30", status: "taken" },
        {
          date: now.toISOString().split("T")[0],
          time: "12:00",
          status: "skipped",
          reason: "No pain today",
        },
      ],
    },
  ];

  // Active and historical alerts
  const alerts = [
    {
      id: "ALT-2026-001",
      patientId: "PMR-2026-0101",
      patientName: "Robert Vance",
      type: "Vital Sign Decompensation",
      severity: "critical",
      triggeringParameter: "SpO2 & Heart Rate",
      currentValue: "SpO2: 91% | HR: 108 bpm",
      previousValue: "SpO2: 97% | HR: 78 bpm (Baseline on Discharge)",
      trendSummary:
        "SpO2 dropped 6% over 48h; HR escalated from 78 to 108 bpm with reported dyspnea.",
      timestamp: subHours(4),
      status: "new",
      recommendedAction:
        "Immediate clinical triage. Telehealth assessment or hospital urgent evaluation required.",
      notes: "",
    },
    {
      id: "ALT-2026-002",
      patientId: "PMR-2026-0101",
      patientName: "Robert Vance",
      type: "Repeated Medication Adherence Failure",
      severity: "warning",
      triggeringParameter: "Apixaban 5mg (Anticoagulant)",
      currentValue: "2 Consecutive Missed Doses",
      previousValue: "100% Adherence in Hospital",
      trendSummary:
        "Missed evening dose yesterday and morning dose today. High thrombosis risk post-CABG.",
      timestamp: subHours(3),
      status: "new",
      recommendedAction:
        "Care coordinator follow-up call to review anticoagulation risks and resume schedule.",
      notes: "",
    },
    {
      id: "ALT-2026-003",
      patientId: "PMR-2026-0103",
      patientName: "Marcus Thorne",
      type: "Rapid Weight Gain & Symptom Exacerbation",
      severity: "critical",
      triggeringParameter: "Bilateral Edema & +4 lbs Weight Gain",
      currentValue: "+4.0 lbs in 48h | 2+ Pedal Edema | Dyspnea on Orthopnea",
      previousValue: "184 lbs on Discharge (Stable)",
      trendSummary:
        "Exceeds clinical safety threshold (>3 lbs in 24-48 hrs). SpO2 decreased to 91%.",
      timestamp: subHours(5),
      status: "acknowledged",
      recommendedAction:
        "Adjust diuretic regimen (consider oral Lasix increase) and schedule emergency outpatient consult.",
      notes:
        "Acknowledged by Dr. Jenkins at 10:15 AM. Contacted patient to double morning Lasix dose.",
    },
    {
      id: "ALT-2026-004",
      patientId: "PMR-2026-0107",
      patientName: "Samuel Jackson",
      type: "Fever Spike & Hypotension Risk",
      severity: "critical",
      triggeringParameter: "Core Temperature & Blood Pressure",
      currentValue: "Temp: 38.4°C (101.1°F) | BP: 96/58 mmHg",
      previousValue: "Temp: 36.9°C | BP: 122/74 mmHg",
      trendSummary:
        "Recurrent sepsis alert. Core temperature rise with widening pulse pressure and tachycardia (104 bpm).",
      timestamp: subHours(8),
      status: "under_review",
      recommendedAction:
        "Evaluate for recurrent bacteremia. Urgent blood cultures and ER referral if BP drops further.",
      notes:
        "Reviewed by Dr. Rivera. Blood cultures ordered via home health nurse.",
    },
    {
      id: "ALT-2026-005",
      patientId: "PMR-2026-0102",
      patientName: "Elena Rostova",
      type: "Mild Exertional Desaturation",
      severity: "informational",
      triggeringParameter: "SpO2 Trend",
      currentValue: "SpO2: 94% (Stable recovery from 92%)",
      previousValue: "SpO2: 92% (Day 1 home)",
      trendSummary:
        "SpO2 recovering post-pneumonia. Spirometry compliance verified.",
      timestamp: subHours(6),
      status: "resolved",
      recommendedAction:
        "Continue current antibiotic schedule and incentive spirometry.",
      notes:
        "Patient reports feeling significantly better today. Spirometry adherence confirmed.",
    },
  ];

  // Follow-up appointments
  const followups = [
    {
      id: "FLW-101",
      patientId: "PMR-2026-0101",
      patientName: "Robert Vance",
      doctorId: "DOC-101",
      doctorName: "Dr. Sarah Jenkins, MD",
      date: addDays(3).split("T")[0],
      time: "10:30 AM",
      type: "In-Person Clinic",
      clinic: "Cardiology Outpatient Clinic, Suite 402",
      purpose: "Post-CABG 2-Week Sternal & Hemodynamic Evaluation",
      notes: "Please bring current pill bottles and recent vitals log.",
      status: "scheduled",
    },
    {
      id: "FLW-102",
      patientId: "PMR-2026-0102",
      patientName: "Elena Rostova",
      doctorId: "DOC-102",
      doctorName: "Dr. Alex Rivera, MD",
      date: addDays(4).split("T")[0],
      time: "02:00 PM",
      type: "Telehealth Video Visit",
      clinic: "Virtual Care Room 3",
      purpose: "Pneumonia Resolution & Inhaler Weaning Check",
      notes: "Have pulse oximeter ready for live check during call.",
      status: "scheduled",
    },
    {
      id: "FLW-103",
      patientId: "PMR-2026-0103",
      patientName: "Marcus Thorne",
      doctorId: "DOC-101",
      doctorName: "Dr. Sarah Jenkins, MD",
      date: addDays(2).split("T")[0],
      time: "11:15 AM",
      type: "Urgent Clinic Visit",
      clinic: "Heart Failure Comprehensive Center",
      purpose: "Fluid Assessment & Electrolyte Panel (BMP)",
      notes: "Fasting not required. Bring morning weight log.",
      status: "scheduled",
    },
    {
      id: "FLW-104",
      patientId: "PMR-2026-0105",
      patientName: "David O'Connor",
      doctorId: "DOC-102",
      doctorName: "Dr. Alex Rivera, MD",
      date: subDays(1).split("T")[0],
      time: "09:00 AM",
      type: "Telehealth Visit",
      clinic: "Virtual Care Room 1",
      purpose: "DKA Post-Discharge Basal Insulin Adjustment",
      notes: "Patient failed to connect to video visit call.",
      status: "missed",
    },
  ];

  // Two-way messaging system
  const messages = [
    {
      id: "MSG-101",
      patientId: "PMR-2026-0101",
      senderRole: "doctor",
      senderName: "Dr. Sarah Jenkins, MD",
      recipientRole: "patient",
      subject: "Urgent: Important Vitals Check & Anticoagulant Reminder",
      category: "alert_followup",
      content:
        "Hello Robert, our monitoring system flagged that your SpO2 has dropped to 91% and heart rate is elevated at 108 bpm, alongside a missed dose of your Eliquis. Please sit in a supported upright chair, take your morning medication immediately, and rest. If you feel shortness of breath worsening or chest discomfort, use the red Emergency Assistance button or dial 911 immediately.",
      timestamp: subHours(3),
      read: true,
    },
    {
      id: "MSG-102",
      patientId: "PMR-2026-0101",
      senderRole: "patient",
      senderName: "Robert Vance",
      recipientRole: "doctor",
      subject: "RE: Urgent: Important Vitals Check & Anticoagulant Reminder",
      category: "general",
      content:
        "Thank you Dr. Jenkins. My wife just helped me take the Eliquis. I am resting in the armchair now. My chest feels slightly tight but bearable. We will keep the pulse oximeter on.",
      timestamp: subHours(2),
      read: false,
    },
    {
      id: "MSG-103",
      patientId: "PMR-2026-0102",
      senderRole: "doctor",
      senderName: "Dr. Alex Rivera, MD",
      recipientRole: "patient",
      subject: "Great progress on your daily check-in!",
      category: "instruction",
      content:
        "Hi Elena, your oxygen levels are climbing nicely back to 94%. Keep doing the incentive spirometer 10 breaths every hour while awake. See you on our video visit Thursday!",
      timestamp: subHours(5),
      read: true,
    },
  ];

  // Configurable clinical thresholds
  const thresholds = {
    spO2MinCritical: 92,
    spO2MinWarning: 94,
    heartRateMaxCritical: 110,
    heartRateMaxWarning: 100,
    heartRateMinCritical: 50,
    heartRateMinWarning: 55,
    tempMaxCritical: 38.3, // Celsius (101°F)
    tempMaxWarning: 37.8,
    bloodPressureSysMaxCritical: 160,
    bloodPressureSysMaxWarning: 140,
    bloodPressureDiaMaxCritical: 100,
    bloodPressureDiaMaxWarning: 90,
    bloodGlucoseMaxCritical: 250,
    bloodGlucoseMaxWarning: 180,
    consecutiveMissedMedsAlert: 2,
    checkInProlongedHours: 36,
  };

  // Generate the 1,000 synthetic patient-day records and 5 disease databases
  const synthetic = generateSyntheticDataset();

  // Combine showcase demo patients with the 100 synthetic patients (avoiding duplicates)
  const existingIds = new Set(patients.map((p) => p.id));
  const mergedPatients = [...patients];
  synthetic.allPatients.forEach((p) => {
    if (!existingIds.has(p.id)) {
      mergedPatients.push(p);
      existingIds.add(p.id);
    }
  });

  return {
    patients: mergedPatients,
    doctors,
    checkins,
    medications,
    alerts,
    followups,
    messages,
    monitoringSchedules: {},
    thresholds,
    ageGroupConfig: defaultAgeGroupConfig,
    diseaseDatabases: synthetic.diseaseDatabases,
    raw1000Records: synthetic.raw1000Records,
  };
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        this.data = JSON.parse(raw);
        this.ensureAssignedDoctors();
        if (!this.data.monitoringSchedules) {
          this.data.monitoringSchedules = {};
          this.save();
        }
        // Ensure diseaseDatabases and raw1000Records exist if old store was saved
        if (
          !this.data.diseaseDatabases ||
          !this.data.raw1000Records ||
          this.data.raw1000Records.length < 1000
        ) {
          const synth = generateSyntheticDataset();
          this.data.diseaseDatabases = synth.diseaseDatabases;
          this.data.raw1000Records = synth.raw1000Records;
          if (!this.data.ageGroupConfig)
            this.data.ageGroupConfig = defaultAgeGroupConfig;

          const existIds = new Set(this.data.patients.map((p) => p.id));
          synth.allPatients.forEach((p) => {
            if (!existIds.has(p.id)) {
              this.data.patients.push(p);
              existIds.add(p.id);
            }
          });
          this.save();
        }
      } catch (err) {
        console.error(
          "Error reading data file, re-seeding default database:",
          err
        );
        this.data = createInitialSeed();
        this.save();
      }
    } else {
      this.data = createInitialSeed();
      this.ensureAssignedDoctors();
      this.save();
    }
  }

  ensureAssignedDoctors() {
    const existingDoctorIds = new Set(
      (this.data.doctors || []).map((doctor) => doctor.id)
    );
    const assignedDoctorIds = new Set(
      (this.data.patients || [])
        .map((patient) => patient.doctorId)
        .filter(Boolean)
    );
    let changed = false;

    assignedDoctorIds.forEach((doctorId) => {
      if (existingDoctorIds.has(doctorId)) return;
      const numericId = doctorId.replace(/^DOC-/, "");
      this.data.doctors.push({
        id: doctorId,
        name: `Dr. Assigned Physician ${numericId}`,
        role: "Attending Recovery Physician",
        department: "Post-Acute Care",
        hospital: "St. Jude Metropolitan Hospital",
        email: `doctor${numericId}@stjude-health.org`,
        password: "doctor123",
        phone: "+1 (555) 990-1099",
      });
      changed = true;
    });

    if (changed) this.save();
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database file:", err);
    }
  }

  resetToSeed() {
    this.data = createInitialSeed();
    this.save();
    return this.data;
  }

  getDiseaseDatabase(name) {
    const key = (name || "").toLowerCase().replace(/\s+/g, "_");
    if (this.data.diseaseDatabases[key]) {
      return this.data.diseaseDatabases[key];
    }
    // Fallback key lookup
    if (key.includes("hyper"))
      return this.data.diseaseDatabases.hypertension || [];
    if (key.includes("diabet"))
      return this.data.diseaseDatabases.diabetes || [];
    if (key.includes("heart"))
      return this.data.diseaseDatabases.heart_disease || [];
    if (key.includes("asth")) return this.data.diseaseDatabases.asthma || [];
    if (key.includes("kidney") || key.includes("ckd"))
      return this.data.diseaseDatabases.ckd || [];
    return [];
  }

  getAllDiseaseDatabases() {
    return this.data.diseaseDatabases || {};
  }

  getRaw1000Records() {
    return this.data.raw1000Records || [];
  }

  getAgeGroupConfig() {
    return this.data.ageGroupConfig || defaultAgeGroupConfig;
  }

  updateAgeGroupConfig(config) {
    this.data.ageGroupConfig = { ...this.getAgeGroupConfig(), ...config };
    this.save();
    return this.data.ageGroupConfig;
  }

  getAgeGroup(age) {
    const cfg = this.getAgeGroupConfig();
    if (age <= (cfg.children?.max ?? 17))
      return cfg.children?.name || "Children / Adolescents";
    if (age <= (cfg.youngAdults?.max ?? 35))
      return cfg.youngAdults?.name || "Young Adults";
    if (age <= (cfg.middleAged?.max ?? 55))
      return cfg.middleAged?.name || "Middle-Aged Adults";
    if (age <= (cfg.olderAdults?.max ?? 70))
      return cfg.olderAdults?.name || "Older Adults";
    return cfg.elderly?.name || "Elderly";
  }

  getPatientBaseline(patientId) {
    const patient = (this.data.patients || []).find((p) => p.id === patientId);
    if (!patient) return null;
    if (patient.baseline) return patient.baseline;

    // Default baseline fallback
    return {
      heartRateMin: 68,
      heartRateMax: 82,
      bloodPressureSysMin: 115,
      bloodPressureSysMax: 130,
      bloodPressureDiaMin: 72,
      bloodPressureDiaMax: 84,
      spO2Min: 96,
      spO2Max: 100,
      bloodGlucoseMin: 85,
      bloodGlucoseMax: 130,
      weightBaseline: 70,
      peakFlowBaseline: 400,
    };
  }

  compareWithBaseline(patientId, vitals) {
    const baseline = this.getPatientBaseline(patientId);
    if (!baseline) return [];

    const deviations = [];

    if (vitals.heartRate) {
      const hr = Number(vitals.heartRate);
      if (hr > baseline.heartRateMax) {
        deviations.push({
          parameter: "Heart Rate",
          current: hr,
          baseline: `${baseline.heartRateMin}–${baseline.heartRateMax} bpm`,
          status: "Above Baseline",
          message: `Heart rate (${hr} bpm) is elevated above patient's typical baseline range (${baseline.heartRateMin}–${baseline.heartRateMax} bpm).`,
        });
      } else if (hr < baseline.heartRateMin) {
        deviations.push({
          parameter: "Heart Rate",
          current: hr,
          baseline: `${baseline.heartRateMin}–${baseline.heartRateMax} bpm`,
          status: "Below Baseline",
          message: `Heart rate (${hr} bpm) is below patient's typical baseline range (${baseline.heartRateMin}–${baseline.heartRateMax} bpm).`,
        });
      }
    }

    if (vitals.bloodPressureSys) {
      const sys = Number(vitals.bloodPressureSys);
      if (sys > baseline.bloodPressureSysMax) {
        deviations.push({
          parameter: "Systolic Blood Pressure",
          current: sys,
          baseline: `${baseline.bloodPressureSysMin}–${baseline.bloodPressureSysMax} mmHg`,
          status: "Above Baseline",
          message: `Systolic pressure (${sys} mmHg) exceeds patient's typical baseline (${baseline.bloodPressureSysMin}–${baseline.bloodPressureSysMax} mmHg).`,
        });
      }
    }

    if (vitals.spO2) {
      const spo2 = Number(vitals.spO2);
      if (spo2 < baseline.spO2Min) {
        deviations.push({
          parameter: "Oxygen Saturation (SpO2)",
          current: spo2,
          baseline: `≥ ${baseline.spO2Min}%`,
          status: "Below Baseline",
          message: `SpO2 (${spo2}%) has dropped below personal baseline threshold (${baseline.spO2Min}%).`,
        });
      }
    }

    if (vitals.bloodGlucose && baseline.bloodGlucoseMax) {
      const bg = Number(vitals.bloodGlucose);
      if (bg > baseline.bloodGlucoseMax) {
        deviations.push({
          parameter: "Blood Glucose",
          current: bg,
          baseline: `${baseline.bloodGlucoseMin}–${baseline.bloodGlucoseMax} mg/dL`,
          status: "Above Baseline",
          message: `Blood glucose (${bg} mg/dL) is above the patient's target baseline range.`,
        });
      }
    }

    if (vitals.peakFlow && baseline.peakFlowBaseline) {
      const pf = Number(vitals.peakFlow);
      if (pf < baseline.peakFlowBaseline * 0.8) {
        deviations.push({
          parameter: "Peak Flow",
          current: pf,
          baseline: `~${baseline.peakFlowBaseline} L/min`,
          status: "Below Baseline",
          message: `Peak flow (${pf} L/min) is down >20% from personal baseline (${baseline.peakFlowBaseline} L/min).`,
        });
      }
    }

    return deviations;
  }

  getAgeDiseaseMatrix() {
    const ageCfg = this.getAgeGroupConfig();
    const ageGroupKeys = [
      {
        key: "children",
        label: ageCfg.children?.name || "Children / Adolescents",
      },
      { key: "youngAdults", label: ageCfg.youngAdults?.name || "Young Adults" },
      {
        key: "middleAged",
        label: ageCfg.middleAged?.name || "Middle-Aged Adults",
      },
      { key: "olderAdults", label: ageCfg.olderAdults?.name || "Older Adults" },
      { key: "elderly", label: ageCfg.elderly?.name || "Elderly" },
    ];

    const diseases = [
      "Hypertension",
      "Diabetes",
      "Heart Disease",
      "Asthma",
      "Chronic Kidney Disease",
    ];
    const matrix = [];

    ageGroupKeys.forEach((ag) => {
      diseases.forEach((dis) => {
        const matching = (this.data.patients || []).filter((p) => {
          const patientAgeGroup = this.getAgeGroup(p.age);
          const diseaseMatch = (p.disease || p.diagnosis || "")
            .toLowerCase()
            .includes(
              dis
                .toLowerCase()
                .replace("chronic kidney disease", "kidney")
                .split(" ")[0]
            );
          return patientAgeGroup === ag.label && diseaseMatch;
        });

        const count = matching.length;
        const avgRecovery =
          count > 0
            ? Math.round(
                matching.reduce((acc, p) => acc + (p.recoveryStage || 65), 0) /
                  count
              )
            : 65;

        let recoveryTrend = "Monitored";
        if (
          ag.key === "elderly" ||
          dis === "Heart Disease" ||
          dis === "Chronic Kidney Disease"
        ) {
          recoveryTrend = "Closely Monitored";
        } else if (ag.key === "youngAdults" || ag.key === "children") {
          recoveryTrend = "Dynamic Progress";
        }

        const highRiskCount = matching.filter(
          (p) => p.currentRiskLevel === "High Risk"
        ).length;
        const riskTrend =
          highRiskCount > 0 ? "Increasing Alert" : "Stable Recovery";

        matrix.push({
          ageGroup: ag.label,
          ageGroupKey: ag.key,
          disease: dis,
          patientCount: count,
          averageRecoveryStage: avgRecovery,
          recoveryTrend,
          riskTrend,
          status: count > 0 ? "Active Telemetry" : "Configured",
        });
      });
    });

    return matrix;
  }

  detectMonitoringGaps(maxGapHours = 36) {
    const now = Date.now();
    const gaps = [];

    (this.data.patients || []).forEach((p) => {
      // Find patient's latest check-in
      const pCheckins = (this.data.checkins || []).filter(
        (c) => c.patientId === p.id
      );
      let latestTime = null;
      if (pCheckins.length > 0) {
        pCheckins.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        latestTime = new Date(pCheckins[0].timestamp).getTime();
      } else if (p.dischargeDate) {
        latestTime = new Date(p.dischargeDate).getTime();
      }

      if (latestTime) {
        const diffHours = (now - latestTime) / (3600 * 1000);
        if (diffHours >= maxGapHours) {
          gaps.push({
            patientId: p.id,
            patientName: p.name,
            disease: p.disease || "General Recovery",
            age: p.age,
            riskLevel: p.currentRiskLevel || "Moderate Risk",
            hoursSinceLastCheckin: Math.round(diffHours),
            lastContact: new Date(latestTime).toLocaleDateString(),
            message: `Monitoring Gap Detected. No health check-in received for ${Math.round(
              diffHours
            )} hours (threshold: ${maxGapHours}h).`,
          });
        }
      }
    });

    return gaps;
  }
}

export const db = new Database();
