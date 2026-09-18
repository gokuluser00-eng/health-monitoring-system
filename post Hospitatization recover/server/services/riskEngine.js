/**
 * AI-Based Risk Prediction Module
 * Evaluates patient check-in data, historical trends, symptoms, medication adherence,
 * clinical history, and generates explainable risk stratification.
 */

export function calculateRiskPrediction(currentReading, previousReading = null, patient = null, medAdherenceRate = 100, thresholds = {}) {
  let score = 10; // baseline normal recovery
  const contributingFactors = [];
  const warnings = [];

  const spO2MinCritical = thresholds.spO2MinCritical || 92;
  const spO2MinWarning = thresholds.spO2MinWarning || 94;
  const hrMaxCritical = thresholds.heartRateMaxCritical || 110;
  const hrMaxWarning = thresholds.heartRateMaxWarning || 100;
  const hrMinCritical = thresholds.heartRateMinCritical || 50;
  const sbpMaxCritical = thresholds.bloodPressureSysMaxCritical || 160;
  const sbpMaxWarning = thresholds.bloodPressureSysMaxWarning || 140;
  const tempMaxCritical = thresholds.tempMaxCritical || 38.3;

  // 1. Oxygen Saturation (SpO2)
  if (currentReading.spO2) {
    if (currentReading.spO2 < spO2MinCritical) {
      score += 35;
      contributingFactors.push(`Critical hypoxemia: SpO2 at ${currentReading.spO2}% (threshold < ${spO2MinCritical}%)`);
      warnings.push("Hypoxemia detected");
    } else if (currentReading.spO2 < spO2MinWarning) {
      score += 20;
      contributingFactors.push(`Borderline oxygen saturation: SpO2 at ${currentReading.spO2}%`);
    }

    // Trend comparison
    if (previousReading && previousReading.spO2) {
      const drop = previousReading.spO2 - currentReading.spO2;
      if (drop >= 4) {
        score += 18;
        contributingFactors.push(`Rapid SpO2 drop: decreased by ${drop}% compared to prior reading (${previousReading.spO2}% → ${currentReading.spO2}%)`);
      }
    }
  }

  // 2. Heart Rate (Pulse)
  if (currentReading.heartRate) {
    if (currentReading.heartRate >= hrMaxCritical) {
      score += 25;
      contributingFactors.push(`Severe tachycardia: Heart rate at ${currentReading.heartRate} bpm (critical limit ≥ ${hrMaxCritical})`);
    } else if (currentReading.heartRate >= hrMaxWarning) {
      score += 15;
      contributingFactors.push(`Elevated heart rate: ${currentReading.heartRate} bpm`);
    } else if (currentReading.heartRate <= hrMinCritical) {
      score += 25;
      contributingFactors.push(`Bradycardia: Heart rate at ${currentReading.heartRate} bpm (critical limit ≤ ${hrMinCritical})`);
    }

    if (previousReading && previousReading.heartRate) {
      const hrIncrease = currentReading.heartRate - previousReading.heartRate;
      if (hrIncrease >= 20) {
        score += 12;
        contributingFactors.push(`Sudden heart rate elevation (+${hrIncrease} bpm increase since last check-in)`);
      }
    }
  }

  // 3. Blood Pressure
  if (currentReading.bloodPressureSys) {
    if (currentReading.bloodPressureSys >= sbpMaxCritical) {
      score += 22;
      contributingFactors.push(`Stage 2 Hypertension: Systolic BP ${currentReading.bloodPressureSys} mmHg (critical limit ≥ ${sbMaxCritical || 160})`);
    } else if (currentReading.bloodPressureSys >= sbpMaxWarning) {
      score += 12;
      contributingFactors.push(`Elevated Systolic BP: ${currentReading.bloodPressureSys} mmHg`);
    } else if (currentReading.bloodPressureSys <= 90) {
      score += 25;
      contributingFactors.push(`Hypotension risk: Systolic BP at ${currentReading.bloodPressureSys} mmHg (risk of hypoperfusion)`);
    }
  }

  // 4. Temperature
  if (currentReading.temperature) {
    if (currentReading.temperature >= tempMaxCritical) {
      score += 25;
      contributingFactors.push(`Fever spike: Core temperature ${currentReading.temperature}°C (≥ ${tempMaxCritical}°C / 101°F)`);
    } else if (currentReading.temperature >= 37.8) {
      score += 12;
      contributingFactors.push(`Low-grade pyrexia: Core temperature ${currentReading.temperature}°C`);
    }
  }

  // 5. Respiratory Rate
  if (currentReading.respiratoryRate) {
    if (currentReading.respiratoryRate >= 24) {
      score += 20;
      contributingFactors.push(`Tachypnea: Respiratory rate ${currentReading.respiratoryRate} breaths/min`);
    } else if (currentReading.respiratoryRate >= 20) {
      score += 10;
      contributingFactors.push(`Mild tachypnea: Respiratory rate ${currentReading.respiratoryRate} breaths/min`);
    }
  }

  // 6. Blood Glucose (if applicable)
  if (currentReading.bloodGlucose) {
    if (currentReading.bloodGlucose >= 250) {
      score += 18;
      contributingFactors.push(`Hyperglycemia: Blood glucose ${currentReading.bloodGlucose} mg/dL`);
    } else if (currentReading.bloodGlucose <= 70) {
      score += 22;
      contributingFactors.push(`Hypoglycemia warning: Blood glucose ${currentReading.bloodGlucose} mg/dL`);
    }
  }

  // 7. Symptoms Evaluation
  let highRiskSymptoms = 0;
  if (currentReading.chestDiscomfort) {
    score += 28;
    highRiskSymptoms++;
    contributingFactors.push("Reported chest discomfort / tightness (high cardiac/pulmonary alert)");
  }
  if (currentReading.breathingDifficulty) {
    score += 24;
    highRiskSymptoms++;
    contributingFactors.push("Reported breathing difficulty / shortness of breath");
  }
  if (currentReading.swelling) {
    score += 14;
    contributingFactors.push("Reported peripheral edema or swelling (fluid retention indicator)");
  }
  if (currentReading.dizziness) {
    score += 12;
    contributingFactors.push("Reported persistent dizziness / lightheadedness (fall & perfusion risk)");
  }
  if (currentReading.nausea) {
    score += 8;
    contributingFactors.push("Reported nausea / vomiting");
  }
  if (currentReading.painLevel >= 7) {
    score += 14;
    contributingFactors.push(`Severe pain reported (Score ${currentReading.painLevel}/10)`);
  }
  if (currentReading.fatigueLevel >= 8) {
    score += 10;
    contributingFactors.push(`Severe debilitating fatigue reported (Score ${currentReading.fatigueLevel}/10)`);
  }

  if (highRiskSymptoms >= 2) {
    score += 15;
    contributingFactors.push("Multiple compound cardiopulmonary symptoms reported concurrently");
  }

  // 8. Medication Adherence
  if (medAdherenceRate < 60) {
    score += 24;
    contributingFactors.push(`Suboptimal medication adherence: only ${medAdherenceRate}% of prescribed doses taken`);
  } else if (medAdherenceRate < 80) {
    score += 14;
    contributingFactors.push(`Recent missed medication doses (${medAdherenceRate}% adherence rate)`);
  }

  // 9. Clinical Acuity & Patient Factors
  if (patient) {
    if (patient.age >= 70) {
      score += 8;
    }
    const highAcuityKeywords = ["CABG", "Heart Failure", "Sepsis", "Infarction", "DKA"];
    const isHighAcuity = highAcuityKeywords.some(kw => 
      (patient.diagnosis && patient.diagnosis.toLowerCase().includes(kw.toLowerCase())) ||
      (patient.hospitalizationReason && patient.hospitalizationReason.toLowerCase().includes(kw.toLowerCase()))
    );
    if (isHighAcuity) {
      score += 10;
    }
  }

  // Bound score between 5 and 100
  score = Math.min(Math.max(score, 5), 100);

  // Classify Risk Category
  let riskLevel = "Low Risk";
  let recommendedAction = "Continue prescribed recovery routine, light ambulation, and complete daily health check-in.";

  if (score >= 70) {
    riskLevel = "High Risk";
    recommendedAction = "URGENT ATTENTION REQUIRED: Contact your designated physician or hospital care team immediately. If experiencing severe chest tightness, sudden shortness of breath, or fainting, activate Emergency Assistance or dial emergency services (911/112).";
  } else if (score >= 35) {
    riskLevel = "Moderate Risk";
    recommendedAction = "ATTENTION NEEDED: Notify your attending care coordinator. Rest in a comfortable position, retake vital signs in 2-3 hours, and adhere strictly to prescribed medications. Expect a telehealth check-in from your clinic.";
  }

  // Fallback factor if healthy
  if (contributingFactors.length === 0) {
    contributingFactors.push("Vital signs within target physiological ranges");
    contributingFactors.push("No acute cardiorespiratory or systemic symptoms reported");
    contributingFactors.push("Satisfactory post-discharge recovery trajectory");
  }

  return {
    score,
    riskLevel,
    contributingFactors,
    recommendedAction,
    timestamp: new Date().toISOString(),
    disclaimer: "This risk assessment is generated by an automated clinical decision-support algorithm based on patient-reported vitals and symptoms. It is not a medical diagnosis and does not substitute for clinical evaluation by a licensed healthcare provider."
  };
}
