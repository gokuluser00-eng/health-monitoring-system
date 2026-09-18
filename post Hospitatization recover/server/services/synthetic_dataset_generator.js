// Synthetic Dataset Generator for Post-Hospitalization Monitoring & Risk Prediction Platform
// Generates:
// - 1,000 synthetic patient-day records (5 diseases x 20 unique patients x 10 days of reports)
// - Maps fields into 5 distinct Disease Databases:
//   1. Hypertension
//   2. Diabetes
//   3. Heart Disease
//   4. Asthma
//   5. Chronic Kidney Disease

export function generateSyntheticDataset() {
  const diseases = [
    { key: 'Hypertension', prefix: 'HTN', name: 'Hypertension' },
    { key: 'Diabetes', prefix: 'DIA', name: 'Diabetes' },
    { key: 'Heart Disease', prefix: 'HRT', name: 'Heart Disease' },
    { key: 'Asthma', prefix: 'AST', name: 'Asthma' },
    { key: 'Chronic Kidney Disease', prefix: 'CKD', name: 'Chronic Kidney Disease' }
  ];

  const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle"
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"
  ];

  const doctors = [
    { id: "DOC-101", name: "Dr. Sarah Jenkins, MD", spec: "Cardiology & Post-Acute Care" },
    { id: "DOC-102", name: "Dr. Alex Rivera, MD", spec: "Pulmonology & Critical Care" },
    { id: "DOC-103", name: "Dr. Rachel Chen, MD", spec: "Endocrinology & Internal Medicine" },
    { id: "DOC-104", name: "Dr. Marcus Sterling, MD", spec: "Nephrology & Renal Medicine" },
    { id: "DOC-105", name: "Dr. Elena Vasquez, MD", spec: "General Internal Medicine" }
  ];

  const raw1000Records = [];
  const allPatients = [];

  const now = new Date();
  const getPastDate = (daysAgo) => {
    const d = new Date(now.getTime() - daysAgo * 86400 * 1000);
    return d.toISOString().split('T')[0];
  };

  let globalPatientIndex = 0;

  // Generate 20 patients per disease
  diseases.forEach((dis, disIdx) => {
    const doctor = doctors[disIdx % doctors.length];

    for (let p = 1; p <= 20; p++) {
      globalPatientIndex++;
      const patientNum = String(p).padStart(2, '0');
      const patientId = `PMR-${dis.prefix}-${patientNum}`;
      
      const fn = firstNames[(globalPatientIndex * 3) % firstNames.length];
      const ln = lastNames[(globalPatientIndex * 7) % lastNames.length];
      const fullName = `${fn} ${ln}`;
      const sex = (p % 2 === 0) ? "Female" : "Male";

      // Age distribution across the 5 groups:
      // Group 1: Children/Adolescents (12-17 for Asthma)
      // Group 2: Young Adults (18-35)
      // Group 3: Middle-Aged (36-55)
      // Group 4: Older Adults (56-70)
      // Group 5: Elderly (71-85)
      let age;
      if (dis.key === 'Asthma' && p <= 4) {
        age = 12 + (p * 1); // 13-16 adolescents
      } else if (p <= 5) {
        age = 22 + (p * 2); // young adult: 24-32
      } else if (p <= 10) {
        age = 38 + (p * 1); // middle aged: 44-48
      } else if (p <= 16) {
        age = 58 + (p * 1); // older adult: 64-70
      } else {
        age = 72 + (p * 1); // elderly: 73-85
      }

      // Assign initial risk profile variation
      let initialRiskTier;
      if (p % 5 === 1) initialRiskTier = "High";
      else if (p % 5 === 2 || p % 5 === 3) initialRiskTier = "Moderate";
      else initialRiskTier = "Low";

      // Disease-specific details & baseline profiles
      let baselineHR = 68 + (p % 12);
      let baselineSys = 118 + (p % 16);
      let baselineDia = 74 + (p % 10);
      let baselineSpO2 = 97 + (p % 3);
      let baselineGlucose = 95 + (p % 25);
      let baselineWeight = 65 + (p % 30);
      let baselinePeakFlow = 420 + (p % 80);

      let existingConditions = [];
      let currentMedications = [];
      let allergies = ["Penicillin", "Sulfa Drugs", "None known", "Aspirin"][p % 4];
      let hospitalizationReason = "";
      let diagnosis = "";

      if (dis.key === 'Hypertension') {
        baselineSys = 135 + (p % 20);
        baselineDia = 88 + (p % 12);
        existingConditions = ["Essential Hypertension", "Mild Hyperlipidemia"];
        currentMedications = ["Amlodipine 10mg Daily", "Lisinopril 20mg Daily", "Hydrochlorothiazide 12.5mg"];
        hospitalizationReason = "Hypertensive urgency with refractory headache and elevated pressures";
        diagnosis = "Hypertensive Urgency - Post-Stabilization";
      } else if (dis.key === 'Diabetes') {
        baselineGlucose = 140 + (p % 50);
        existingConditions = ["Type 2 Diabetes Mellitus", "Diabetic Neuropathy"];
        currentMedications = ["Metformin 1000mg BID", "Glipizide 5mg", "Insulin Glargine 18 units QHS"];
        hospitalizationReason = "Hyperglycemic crisis with mild dehydration and ketonuria";
        diagnosis = "Uncontrolled Hyperglycemia / Hyperosmolar State";
      } else if (dis.key === 'Heart Disease') {
        baselineHR = 76 + (p % 16);
        baselineSys = 126 + (p % 18);
        baselineSpO2 = 95 + (p % 3);
        existingConditions = ["Coronary Artery Disease", "Ischemic Cardiomyopathy (NYHA II)"];
        currentMedications = ["Carvedilol 25mg BID", "Atorvastatin 40mg", "Aspirin 81mg", "Furosemide 20mg"];
        hospitalizationReason = "Acute coronary syndrome followed by percutaneous coronary intervention";
        diagnosis = "Post-PCI Stenting / Coronary Artery Disease";
      } else if (dis.key === 'Asthma') {
        baselineSpO2 = 96 + (p % 3);
        baselinePeakFlow = (age < 18) ? 320 + (p % 40) : 410 + (p % 70);
        existingConditions = ["Moderate Persistent Asthma", "Allergic Rhinitis"];
        currentMedications = ["Fluticasone/Salmeterol 250/50 Inhaler BID", "Albuterol Inhaler PRN", "Montelukast 10mg"];
        hospitalizationReason = "Severe acute asthma exacerbation requiring bronchodilator nebulization and systemic steroids";
        diagnosis = "Acute Asthma Exacerbation (Resolving)";
      } else if (dis.key === 'Chronic Kidney Disease') {
        baselineSys = 132 + (p % 18);
        baselineDia = 82 + (p % 10);
        baselineWeight = 72 + (p % 25);
        existingConditions = ["Chronic Kidney Disease Stage 3b", "Renal Hypertension", "Anemia of CKD"];
        currentMedications = ["Losartan 50mg", "Sodium Bicarbonate 650mg BID", "Torsemide 20mg", "Erythropoietin Alpha"];
        hospitalizationReason = "Acute kidney injury superimposed on CKD with metabolic acidosis and fluid overload";
        diagnosis = "AKI on CKD Stage 3b with Volume Overload";
      }

      const patientReports = [];

      // Generate 10 consecutive daily reports for this patient
      for (let day = 1; day <= 10; day++) {
        // Report day 1 is 9 days ago, day 10 is today (0 days ago)
        const daysAgo = 10 - day;
        const reportDate = getPastDate(daysAgo);

        // Daily progression: simulate improving, stable, or acute spike
        let hr = baselineHR;
        let sys = baselineSys;
        let dia = baselineDia;
        let spo2 = baselineSpO2;
        let gluc = baselineGlucose;
        let wt = baselineWeight;
        let pf = baselinePeakFlow;
        let urine = "Normal (Pale Amber, 1500mL/day)";
        let meals = "Balanced low-sodium meals taken 3x daily";
        let medStatus = "Taken on schedule";
        let symptomList = [];

        // Trend logic
        if (initialRiskTier === 'High' && day >= 7) {
          // Patient experiences a risk spike on recent days
          hr += 18 + (day % 6);
          if (dis.key === 'Hypertension') sys += 25;
          if (dis.key === 'Diabetes') gluc += 75;
          if (dis.key === 'Heart Disease') { hr += 22; spo2 -= 4; wt += 2.8; }
          if (dis.key === 'Asthma') { pf -= 120; spo2 -= 5; }
          if (dis.key === 'Chronic Kidney Disease') { wt += 3.2; urine = "Decreased output (< 700mL/day), dark amber, foamy"; }
          symptomList.push(dis.key === 'Asthma' ? "Wheezing, Nocturnal cough" : "Fatigue, Dyspnea on mild exertion");
          medStatus = day === 9 ? "Missed evening dose" : "Taken on schedule";
        } else if (initialRiskTier === 'Moderate') {
          // Moderate variation
          hr += (day % 3 === 0 ? 10 : 2);
          sys += (day % 2 === 0 ? 8 : -4);
          if (dis.key === 'Diabetes') gluc += (day % 3 === 0 ? 30 : -10);
          if (dis.key === 'Asthma') pf += (day * 6);
          if (day % 4 === 0) symptomList.push("Mild headache", "Transient dizziness");
          else symptomList.push("Occasional fatigue");
        } else {
          // Low risk: steady healthy recovery
          hr += Math.sin(day) * 3;
          sys -= (day * 1.2);
          if (dis.key === 'Asthma') pf += (day * 12);
          symptomList.push("Feeling well, walking 30 mins daily");
        }

        // Clamp values to realistic physiological bounds
        hr = Math.round(Math.max(50, Math.min(135, hr)));
        sys = Math.round(Math.max(90, Math.min(195, sys)));
        dia = Math.round(Math.max(55, Math.min(115, dia)));
        spo2 = Math.round(Math.max(88, Math.min(100, spo2)));
        gluc = Math.round(Math.max(65, Math.min(340, gluc)));
        wt = parseFloat(Math.max(40, Math.min(140, wt)).toFixed(1));
        pf = Math.round(Math.max(180, Math.min(650, pf)));

        const bpString = `${sys}/${dia} mmHg`;
        const symptomsStr = symptomList.join('; ') || "None reported";

        // Create the Raw Excel Record
        const record = {
          Record_ID: `REC-${dis.prefix}-${patientNum}-${String(day).padStart(2, '0')}`,
          Patient_ID: patientId,
          Patient_Name: fullName,
          Age: age,
          Sex: sex,
          Disease: dis.name,
          Report_Day: day,
          Date: reportDate,
          Symptoms: symptomsStr,
          Blood_Pressure: bpString,
          Heart_Rate_bpm: hr,
          Weight_kg: wt,
          Blood_Glucose_mg_dL: dis.key === 'Diabetes' ? gluc : null,
          Meals: meals,
          Medication: medStatus,
          SpO2_percent: spo2,
          Peak_Flow_L_min: dis.key === 'Asthma' ? pf : null,
          Urine_Changes: dis.key === 'Chronic Kidney Disease' ? urine : null
        };

        raw1000Records.push(record);
        patientReports.push(record);
      }

      // Calculate recent risk and recovery status based on 10th day
      let finalRiskLevel = "Low Risk";
      let finalRiskScore = 18;
      let finalRiskTrend = "Improving";
      let recoveryStage = 75;

      if (initialRiskTier === 'High') {
        finalRiskLevel = "High Risk";
        finalRiskScore = 78 + (p % 15);
        finalRiskTrend = "Increasing";
        recoveryStage = 42 + (p % 15);
      } else if (initialRiskTier === 'Moderate') {
        finalRiskLevel = "Moderate Risk";
        finalRiskScore = 48 + (p % 12);
        finalRiskTrend = "Stable";
        recoveryStage = 62 + (p % 12);
      } else {
        finalRiskLevel = "Low Risk";
        finalRiskScore = 14 + (p % 10);
        finalRiskTrend = "Improving";
        recoveryStage = 85 + (p % 12);
      }

      const patientObj = {
        id: patientId,
        name: fullName,
        age: age,
        gender: sex,
        phone: `+1 (555) ${100 + globalPatientIndex}-${2000 + p}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.org`,
        password: "patient123",
        address: `${100 + p * 12} Healthcare Blvd, Suite ${p}, Metro City`,
        emergencyContactName: `${fn} Family Contact`,
        emergencyContactPhone: `+1 (555) 999-${1000 + p}`,
        bloodGroup: ["A+", "O+", "B+", "AB+", "A-", "O-"][p % 6],
        disease: dis.name,
        diseaseCategory: dis.name,
        existingConditions: existingConditions,
        allergies: [allergies],
        currentMedications: currentMedications,
        medicalHistory: `Diagnosed with ${dis.name}. Chronic management with standard guideline-directed medical therapy.`,
        hospitalName: "St. Jude Metropolitan Hospital",
        doctorName: doctor.name,
        doctorId: doctor.id,
        admissionDate: getPastDate(15),
        dischargeDate: getPastDate(10),
        hospitalizationReason: hospitalizationReason,
        diagnosis: diagnosis,
        dischargeInstructions: `Daily biometric check-in. Adhere strictly to prescribed medications. Report symptom escalation immediately.`,
        followUpDate: getPastDate(-4), // 4 days in future
        recoveryStatus: finalRiskLevel === 'High Risk' ? 'Guarded - Active Review' : (finalRiskLevel === 'Moderate Risk' ? 'Monitored Recovery' : 'Progressing Well'),
        currentRiskLevel: finalRiskLevel,
        riskTrend: finalRiskTrend,
        riskScore: finalRiskScore,
        recoveryStage: recoveryStage,
        recoveryTrend: finalRiskTrend === 'Increasing' ? 'Guarded' : (finalRiskTrend === 'Improving' ? 'Improving' : 'Stable'),
        lastCheckInDate: getPastDate(0),
        reportsCount: 10,
        baseline: {
          heartRateMin: baselineHR - 4,
          heartRateMax: baselineHR + 6,
          bloodPressureSysMin: baselineSys - 8,
          bloodPressureSysMax: baselineSys + 8,
          bloodPressureDiaMin: baselineDia - 5,
          bloodPressureDiaMax: baselineDia + 5,
          spO2Min: baselineSpO2 - 1,
          spO2Max: 100,
          bloodGlucoseMin: dis.key === 'Diabetes' ? baselineGlucose - 15 : null,
          bloodGlucoseMax: dis.key === 'Diabetes' ? baselineGlucose + 20 : null,
          weightBaseline: baselineWeight,
          peakFlowBaseline: dis.key === 'Asthma' ? baselinePeakFlow : null
        }
      };

      allPatients.push(patientObj);
    }
  });

  // Map into the 5 Disease-Specific Databases according to Section 5
  // Database 1 — Hypertension
  const hypertension_db = raw1000Records
    .filter(r => r.Disease === 'Hypertension')
    .map(r => {
      const p = allPatients.find(pat => pat.id === r.Patient_ID);
      return {
        patientId: r.Patient_ID,
        patientName: r.Patient_Name,
        age: r.Age,
        sex: r.Sex,
        symptoms: r.Symptoms,
        bloodPressure: r.Blood_Pressure,
        heartRate: r.Heart_Rate_bpm,
        weight: r.Weight_kg,
        medication: r.Medication,
        meals: r.Meals,
        spO2: r.SpO2_percent,
        reportDay: r.Report_Day,
        date: r.Date,
        riskStatus: p ? p.currentRiskLevel : 'Moderate Risk',
        recoveryStatus: p ? p.recoveryStatus : 'Monitored Recovery'
      };
    });

  // Database 2 — Diabetes
  const diabetes_db = raw1000Records
    .filter(r => r.Disease === 'Diabetes')
    .map(r => {
      const p = allPatients.find(pat => pat.id === r.Patient_ID);
      return {
        patientId: r.Patient_ID,
        patientName: r.Patient_Name,
        age: r.Age,
        sex: r.Sex,
        symptoms: r.Symptoms,
        bloodGlucose: r.Blood_Glucose_mg_dL,
        bloodPressure: r.Blood_Pressure,
        heartRate: r.Heart_Rate_bpm,
        weight: r.Weight_kg,
        meals: r.Meals,
        medication: r.Medication,
        spO2: r.SpO2_percent,
        reportDay: r.Report_Day,
        date: r.Date,
        riskStatus: p ? p.currentRiskLevel : 'Moderate Risk',
        recoveryStatus: p ? p.recoveryStatus : 'Monitored Recovery'
      };
    });

  // Database 3 — Heart Disease
  const heart_disease_db = raw1000Records
    .filter(r => r.Disease === 'Heart Disease')
    .map(r => {
      const p = allPatients.find(pat => pat.id === r.Patient_ID);
      return {
        patientId: r.Patient_ID,
        patientName: r.Patient_Name,
        age: r.Age,
        sex: r.Sex,
        symptoms: r.Symptoms,
        bloodPressure: r.Blood_Pressure,
        heartRate: r.Heart_Rate_bpm,
        weight: r.Weight_kg,
        medication: r.Medication,
        spO2: r.SpO2_percent,
        reportDay: r.Report_Day,
        date: r.Date,
        riskStatus: p ? p.currentRiskLevel : 'Moderate Risk',
        recoveryStatus: p ? p.recoveryStatus : 'Monitored Recovery'
      };
    });

  // Database 4 — Asthma
  const asthma_db = raw1000Records
    .filter(r => r.Disease === 'Asthma')
    .map(r => {
      const p = allPatients.find(pat => pat.id === r.Patient_ID);
      return {
        patientId: r.Patient_ID,
        patientName: r.Patient_Name,
        age: r.Age,
        sex: r.Sex,
        symptoms: r.Symptoms,
        spO2: r.SpO2_percent,
        heartRate: r.Heart_Rate_bpm,
        peakFlow: r.Peak_Flow_L_min,
        medication: r.Medication,
        bloodPressure: r.Blood_Pressure,
        reportDay: r.Report_Day,
        date: r.Date,
        riskStatus: p ? p.currentRiskLevel : 'Moderate Risk',
        recoveryStatus: p ? p.recoveryStatus : 'Monitored Recovery'
      };
    });

  // Database 5 — Chronic Kidney Disease
  const ckd_db = raw1000Records
    .filter(r => r.Disease === 'Chronic Kidney Disease')
    .map(r => {
      const p = allPatients.find(pat => pat.id === r.Patient_ID);
      return {
        patientId: r.Patient_ID,
        patientName: r.Patient_Name,
        age: r.Age,
        sex: r.Sex,
        symptoms: r.Symptoms,
        bloodPressure: r.Blood_Pressure,
        heartRate: r.Heart_Rate_bpm,
        weight: r.Weight_kg,
        medication: r.Medication,
        spO2: r.SpO2_percent,
        urineChanges: r.Urine_Changes,
        reportDay: r.Report_Day,
        date: r.Date,
        riskStatus: p ? p.currentRiskLevel : 'Moderate Risk',
        recoveryStatus: p ? p.recoveryStatus : 'Monitored Recovery'
      };
    });

  return {
    raw1000Records,
    allPatients,
    diseaseDatabases: {
      hypertension: hypertension_db,
      diabetes: diabetes_db,
      heart_disease: heart_disease_db,
      asthma: asthma_db,
      ckd: ckd_db
    }
  };
}
