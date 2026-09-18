import express from 'express';
import { db } from '../services/db.js';
import { savePatientToExcel } from '../services/excelStorage.js';

const router = express.Router();

// Emergency Red Flags list as per Section 3
const EMERGENCY_RED_FLAGS = [
  { id: 'chest_pain', label: 'Severe / persistent chest discomfort', keywords: ['chest', 'angina', 'crushing', 'heart attack', 'pressure in chest'] },
  { id: 'severe_dyspnea', label: 'Severe breathing difficulty / gasping', keywords: ['gasping', 'cannot breathe', 'severe dyspnea', 'suffocating', 'turning blue'] },
  { id: 'unilateral_weakness', label: 'Sudden weakness on one side of the body', keywords: ['weakness one side', 'arm numb', 'leg weak', 'hemiparesis'] },
  { id: 'facial_drooping', label: 'Sudden facial drooping', keywords: ['drooping', 'face drop', 'crooked smile'] },
  { id: 'speech_difficulty', label: 'Sudden difficulty speaking / slurred speech', keywords: ['slurred', 'cannot talk', 'aphasia', 'jumbled words'] },
  { id: 'loss_of_consciousness', label: 'Loss of consciousness / syncope', keywords: ['fainted', 'passed out', 'unconscious', 'blackout'] },
  { id: 'severe_confusion', label: 'Severe sudden confusion / disorientation', keywords: ['delirium', 'severe confusion', 'does not know where they are'] },
  { id: 'seizure', label: 'Seizure or uncontrolled convulsion', keywords: ['seizure', 'convulsion', 'fitting'] },
  { id: 'thunderclap_headache', label: 'Sudden severe "thunderclap" headache', keywords: ['worst headache of life', 'thunderclap', 'sudden severe headache'] },
  { id: 'significant_deterioration', label: 'Significant rapid deterioration', keywords: ['rapidly worsening', 'collapsing', 'critical decline'] }
];

// POST /api/prehospital/triage
router.post('/triage', (req, res) => {
  const {
    age,
    gender,
    existingConditions = '',
    medications = '',
    allergies = '',
    symptoms = '',
    selectedRedFlags = [],
    startedAgo = '1-2 days',
    worsening = false,
    severity = 'Moderate'
  } = req.body;

  const normalizedSymptoms = (symptoms || '').toLowerCase();

  // 1. Emergency Red-Flag Check
  const detectedFlags = [];

  // Check explicit red flag selections
  if (Array.isArray(selectedRedFlags)) {
    selectedRedFlags.forEach(flagId => {
      const found = EMERGENCY_RED_FLAGS.find(f => f.id === flagId);
      if (found) detectedFlags.push(found.label);
    });
  }

  // Check text mentions
  EMERGENCY_RED_FLAGS.forEach(flag => {
    if (!detectedFlags.includes(flag.label)) {
      const match = flag.keywords.some(kw => normalizedSymptoms.includes(kw));
      if (match) detectedFlags.push(flag.label);
    }
  });

  if (severity === 'Severe' && worsening) {
    if (!detectedFlags.includes('Significant rapid deterioration')) {
      detectedFlags.push('Significant rapid deterioration with severe worsening');
    }
  }

  // If any red flag detected -> immediate emergency guidance (Section 3)
  if (detectedFlags.length > 0) {
    return res.json({
      isEmergency: true,
      alertLevel: 'CRITICAL_EMERGENCY',
      title: 'Potential Emergency Warning Signs Detected',
      message: 'Potential emergency warning signs detected. Please seek immediate medical attention.',
      detectedFlags,
      actionPlan: [
        'Call Emergency Medical Services (911 or local emergency number) immediately.',
        'Do NOT drive yourself to the emergency department; request an ambulance.',
        'Keep emergency contacts informed.',
        'Sit upright or in a comfortable position while awaiting emergency responders.'
      ],
      disclaimer: 'This platform provides monitoring and decision-support information. It does not provide a medical diagnosis or replace professional emergency care.'
    });
  }

  // 2. Pre-Hospital Symptom Guidance (Section 4)
  // If no emergency red flag, categorize symptom combination into Possible Symptom Categories (NOT diagnosis)
  const categories = [];

  // Respiratory category
  if (
    normalizedSymptoms.includes('cough') ||
    normalizedSymptoms.includes('fever') ||
    normalizedSymptoms.includes('shortness of breath') ||
    normalizedSymptoms.includes('breath') ||
    normalizedSymptoms.includes('wheez') ||
    normalizedSymptoms.includes('sore throat') ||
    normalizedSymptoms.includes('congestion')
  ) {
    categories.push({
      category: 'Respiratory Symptom Cluster',
      guidance: 'These symptoms may be associated with several respiratory conditions (such as upper/lower airway irritation, asthma, bronchitis, or viral respiratory infection). A healthcare professional can determine the actual cause.',
      recommendedTimeframe: worsening ? 'Seek same-day outpatient evaluation' : 'Consult healthcare provider within 24 to 48 hours',
      precautions: 'Monitor oxygen saturation with a pulse oximeter if available. Rest, stay well-hydrated, and immediately call 911 if breathing difficulty escalates.'
    });
  }

  // Cardiovascular category
  if (
    normalizedSymptoms.includes('palpitation') ||
    normalizedSymptoms.includes('rapid heart') ||
    normalizedSymptoms.includes('dizziness') ||
    normalizedSymptoms.includes('lightheaded') ||
    normalizedSymptoms.includes('high pressure') ||
    normalizedSymptoms.includes('swollen ankles')
  ) {
    categories.push({
      category: 'Cardiovascular & Hemodynamic Indicators',
      guidance: 'These symptoms may be associated with blood pressure fluctuations, volume shifts, or cardiac rhythm variations. A healthcare professional can determine the actual cause.',
      recommendedTimeframe: 'Clinical evaluation recommended within 24 hours',
      precautions: 'Check and record blood pressure and resting pulse. Avoid strenuous physical exertion and sudden postural changes.'
    });
  }

  // Metabolic / Glycemic category
  if (
    normalizedSymptoms.includes('thirst') ||
    normalizedSymptoms.includes('frequent urination') ||
    normalizedSymptoms.includes('shak') ||
    normalizedSymptoms.includes('sweat') ||
    normalizedSymptoms.includes('dry mouth') ||
    normalizedSymptoms.includes('glucose')
  ) {
    categories.push({
      category: 'Metabolic & Glycemic Variations',
      guidance: 'These symptoms may be associated with blood glucose disregulation or dehydration. A healthcare professional can determine the actual cause.',
      recommendedTimeframe: 'Consult primary care doctor or endocrinologist promptly',
      precautions: 'Check fingerstick blood glucose if you have a glucometer. Maintain balanced hydration.'
    });
  }

  // Renal / Fluid retention category
  if (
    normalizedSymptoms.includes('urine') ||
    normalizedSymptoms.includes('swelling') ||
    normalizedSymptoms.includes('edema') ||
    normalizedSymptoms.includes('flank') ||
    normalizedSymptoms.includes('puffy')
  ) {
    categories.push({
      category: 'Renal & Fluid Balance Indicators',
      guidance: 'These symptoms may be associated with fluid retention or renal tract changes. A healthcare professional can determine the actual cause.',
      recommendedTimeframe: 'Schedule urgent clinical review within 24-48 hours',
      precautions: 'Track daily weight and fluid intake. Limit added dietary salt.'
    });
  }

  // General / Default category
  if (categories.length === 0) {
    categories.push({
      category: 'General Systemic Symptoms',
      guidance: 'These reported symptoms may be related to non-specific systemic or post-viral fatigue. A healthcare professional can determine the actual cause.',
      recommendedTimeframe: 'Monitor symptoms; schedule a healthcare consultation if symptoms persist > 3 days or worsen',
      precautions: 'Prioritize restorative rest, balanced nutrition, and maintain a symptom journal.'
    });
  }

  return res.json({
    isEmergency: false,
    alertLevel: 'ROUTINE_GUIDANCE',
    title: 'Pre-Hospital Symptom Guidance',
    message: 'No immediate emergency warning sign detected. Below is guidance on possible symptom categories and when to seek medical care.',
    categories,
    intakeSummary: {
      age,
      gender,
      existingConditions: existingConditions || 'None reported',
      medications: medications || 'None reported',
      allergies: allergies || 'None reported',
      symptoms,
      startedAgo,
      worsening: worsening ? 'Yes (escalating)' : 'Stable',
      severity
    },
    disclaimer: 'This platform provides monitoring and decision-support information. It does not provide a medical diagnosis or replace professional medical care.'
  });
});

// POST /api/prehospital/admit-discharge
// Simulates the hospital journey: Pre-Hospital -> Medical Evaluation -> Hospitalization -> Discharge -> Creates official Patient Profile
router.post('/admit-discharge', (req, res) => {
  const {
    fullName,
    age,
    gender,
    phone,
    email,
    disease,
    diagnosis,
    hospitalizationReason,
    hospitalName = 'St. Jude Metropolitan Hospital',
    doctorName = 'Dr. Sarah Jenkins, MD',
    existingConditions = [],
    allergies = ['None known'],
    currentMedications = [],
    dischargeInstructions = 'Daily biometric monitoring and strict medication adherence.',
    emergencyContactName = 'Family Member',
    emergencyContactPhone = '+1 (555) 999-0000'
  } = req.body;

  const normalizedEmail = String(email || '').trim();
  const normalizedName = String(fullName || '').trim();
  if (!normalizedName || !normalizedEmail) {
    return res.status(400).json({ success: false, message: 'Full name and email are required.' });
  }

  const diseasePrefixMap = {
    'Hypertension': 'HTN',
    'Diabetes': 'DIA',
    'Heart Disease': 'HRT',
    'Asthma': 'AST',
    'Chronic Kidney Disease': 'CKD'
  };

  const prefix = diseasePrefixMap[disease] || 'REC';
  const newId = `PMR-${prefix}-${String(Math.floor(100 + Math.random() * 900))}`;
  const now = new Date();
  const subDays = (d) => new Date(now.getTime() - d * 86400 * 1000).toISOString().split('T')[0];
  const addDays = (d) => new Date(now.getTime() + d * 86400 * 1000).toISOString().split('T')[0];

  const newPatient = {
    id: newId,
    name: fullName || 'New Recovery Patient',
    age: Number(age) || 45,
    gender: gender || 'Other',
    phone: phone || '+1 (555) 000-1122',
    email: email || `${newId.toLowerCase()}@recoverycare.org`,
    password: 'patient123',
    address: '450 Healthcare Way, Metro City',
    emergencyContactName,
    emergencyContactPhone,
    bloodGroup: 'O+',
    disease: disease || 'Hypertension',
    diseaseCategory: disease || 'Hypertension',
    existingConditions: Array.isArray(existingConditions) ? existingConditions : [existingConditions],
    allergies: Array.isArray(allergies) ? allergies : [allergies],
    currentMedications: Array.isArray(currentMedications) ? currentMedications : [currentMedications],
    medicalHistory: 'Registered following pre-hospital guidance and simulated inpatient evaluation.',
    hospitalName,
    doctorName,
    doctorId: 'DOC-101',
    admissionDate: subDays(5),
    dischargeDate: subDays(0), // Today
    hospitalizationReason: hospitalizationReason || 'Acute stabilization for elevated symptoms',
    diagnosis: diagnosis || `${disease} - Post-Stabilization`,
    dischargeInstructions,
    followUpDate: addDays(7),
    recoveryStatus: 'Monitored Recovery',
    currentRiskLevel: 'Low Risk',
    riskTrend: 'Improving',
    riskScore: 22,
    recoveryStage: 55,
    recoveryTrend: 'Improving',
    lastCheckInDate: subDays(0),
    reportsCount: 1,
    baseline: {
      heartRateMin: 68,
      heartRateMax: 80,
      bloodPressureSysMin: 118,
      bloodPressureSysMax: 132,
      bloodPressureDiaMin: 74,
      bloodPressureDiaMax: 84,
      spO2Min: 96,
      spO2Max: 100,
      weightBaseline: 70
    }
  };

  try {
    const excelResult = savePatientToExcel(newPatient);
    if (!excelResult?.excelSaved) {
      throw new Error('Excel workbook save did not complete successfully.');
    }

    db.data.patients.unshift(newPatient);
    db.save();
    console.log('PATIENT_DATABASE_SAVE_SUCCESS');

    return res.json({
      success: true,
      message: 'Patient created and Excel report saved successfully',
      patientId: newPatient.id,
      excelSaved: true,
      patient: newPatient
    });
  } catch (error) {
    console.error('EXCEL_SAVE_FAILED');
    console.error('ERROR:', error?.message || error);
    console.error('FILE_PATH:', new URL('../data/patient_registry.xlsx', import.meta.url).pathname);
    return res.status(500).json({
      success: false,
      message: 'Patient creation failed because the Excel report could not be saved',
      excelSaved: false
    });
  }
});

export default router;
