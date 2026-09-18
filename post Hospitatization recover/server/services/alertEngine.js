/**
 * Early Warning Alert System Engine
 * Detects potentially concerning changes, threshold breaches, trend deteriorations,
 * compound symptoms, and generates actionable alerts for both patient and admin/doctor dashboards.
 */

export function evaluateAlerts(checkin, previousCheckin, patient, medications, thresholds) {
  const generatedAlerts = [];
  const now = new Date().toISOString();

  const spO2MinCritical = thresholds.spO2MinCritical || 92;
  const spO2MinWarning = thresholds.spO2MinWarning || 94;
  const hrMaxCritical = thresholds.heartRateMaxCritical || 110;
  const hrMaxWarning = thresholds.heartRateMaxWarning || 100;
  const hrMinCritical = thresholds.heartRateMinCritical || 50;
  const sbpMaxCritical = thresholds.bloodPressureSysMaxCritical || 160;
  const sbpMaxWarning = thresholds.bloodPressureSysMaxWarning || 140;
  const tempMaxCritical = thresholds.tempMaxCritical || 38.3;

  // 1. SpO2 critical drop or low value
  if (checkin.spO2 && checkin.spO2 <= spO2MinCritical) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-1`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Severe Desaturation Alert",
      severity: "critical",
      triggeringParameter: "Oxygen Saturation (SpO2)",
      currentValue: `${checkin.spO2}%`,
      previousValue: previousCheckin ? `${previousCheckin.spO2}%` : "Baseline",
      trendSummary: previousCheckin 
        ? `SpO2 fell by ${previousCheckin.spO2 - checkin.spO2}% since last measurement (now ${checkin.spO2}% ≤ ${spO2MinCritical}%).` 
        : `SpO2 reading critically low at ${checkin.spO2}%.`,
      timestamp: now,
      status: "new",
      recommendedAction: "Verify probe placement. Administer supplemental O2 if prescribed. Urgent doctor or telehealth assessment needed."
    });
  } else if (checkin.spO2 && checkin.spO2 < spO2MinWarning) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-2`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Borderline SpO2 Warning",
      severity: "warning",
      triggeringParameter: "Oxygen Saturation (SpO2)",
      currentValue: `${checkin.spO2}%`,
      previousValue: previousCheckin ? `${previousCheckin.spO2}%` : "Baseline",
      trendSummary: `Oxygen saturation below normal recovery threshold (${checkin.spO2}%).`,
      timestamp: now,
      status: "new",
      recommendedAction: "Rest upright, perform incentive spirometry, and repeat measurement in 1 hour."
    });
  }

  // 2. Heart Rate extremes or rapid increase
  if (checkin.heartRate && checkin.heartRate >= hrMaxCritical) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-3`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Severe Tachycardia Alert",
      severity: "critical",
      triggeringParameter: "Heart Rate",
      currentValue: `${checkin.heartRate} bpm`,
      previousValue: previousCheckin ? `${previousCheckin.heartRate} bpm` : "Baseline",
      trendSummary: `Resting heart rate exceeded critical threshold (${checkin.heartRate} bpm ≥ ${hrMaxCritical} bpm).`,
      timestamp: now,
      status: "new",
      recommendedAction: "Evaluate for arrhythmia, dehydration, infection, or medication lapse. Order ECG/telemetry review."
    });
  } else if (checkin.heartRate && checkin.heartRate <= hrMinCritical) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-4`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Severe Bradycardia Alert",
      severity: "critical",
      triggeringParameter: "Heart Rate",
      currentValue: `${checkin.heartRate} bpm`,
      previousValue: previousCheckin ? `${previousCheckin.heartRate} bpm` : "Baseline",
      trendSummary: `Resting heart rate severely depressed (${checkin.heartRate} bpm ≤ ${hrMinCritical} bpm).`,
      timestamp: now,
      status: "new",
      recommendedAction: "Check beta-blocker/antiarrhythmic dosing. Evaluate patient for dizziness or presyncope."
    });
  }

  // 3. Blood pressure severe elevation or collapse
  if (checkin.bloodPressureSys && checkin.bloodPressureSys >= sbpMaxCritical) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-5`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Hypertensive Urgency Alert",
      severity: "critical",
      triggeringParameter: "Systolic Blood Pressure",
      currentValue: `${checkin.bloodPressureSys}/${checkin.bloodPressureDia || '--'} mmHg`,
      previousValue: previousCheckin ? `${previousCheckin.bloodPressureSys} mmHg` : "Baseline",
      trendSummary: `Systolic BP spike to ${checkin.bloodPressureSys} mmHg. High risk of cardiovascular strain.`,
      timestamp: now,
      status: "new",
      recommendedAction: "Review antihypertensive regimen and check adherence. Screen for headache or vision changes."
    });
  }

  // 4. Core temperature spike
  if (checkin.temperature && checkin.temperature >= tempMaxCritical) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-6`,
      patientId: patient.id,
      patientName: patient.name,
      type: "High Febrile Episode Alert",
      severity: "critical",
      triggeringParameter: "Body Temperature",
      currentValue: `${checkin.temperature}°C (${(checkin.temperature * 9/5 + 32).toFixed(1)}°F)`,
      previousValue: previousCheckin ? `${previousCheckin.temperature}°C` : "Baseline",
      trendSummary: `Temperature elevated to ${checkin.temperature}°C. Potential surgical site or systemic infection.`,
      timestamp: now,
      status: "new",
      recommendedAction: "Inspect surgical wounds/catheter sites. Consider CBC, urinalysis, or blood cultures."
    });
  }

  // 5. Compound Symptoms (e.g. Chest Discomfort + Shortness of Breath)
  if (checkin.chestDiscomfort && checkin.breathingDifficulty) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-7`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Acute Cardiopulmonary Symptom Cluster",
      severity: "critical",
      triggeringParameter: "Compound Symptoms",
      currentValue: "Chest Discomfort + Dyspnea",
      previousValue: "None reported",
      trendSummary: "Patient reported co-occurring chest discomfort and difficulty breathing.",
      timestamp: now,
      status: "new",
      recommendedAction: "Immediate emergency clinical evaluation recommended. Advise patient to seek emergency care."
    });
  } else if (checkin.chestDiscomfort) {
    generatedAlerts.push({
      id: `ALT-${Date.now()}-8`,
      patientId: patient.id,
      patientName: patient.name,
      type: "Chest Discomfort Warning",
      severity: "warning",
      triggeringParameter: "Reported Symptom",
      currentValue: "Chest tightness / discomfort",
      previousValue: "None reported",
      trendSummary: "New onset of chest discomfort reported during daily check-in.",
      timestamp: now,
      status: "new",
      recommendedAction: "Contact patient promptly to characterize chest symptoms and evaluate stability."
    });
  }

  return generatedAlerts;
}

/**
 * Check for medication adherence alerts (e.g. consecutive missed critical medications)
 */
export function checkMedicationAlerts(patient, medications, thresholdConsecutive = 2) {
  const alerts = [];
  const patientMeds = medications.filter(m => m.patientId === patient.id);

  for (const med of patientMeds) {
    if (!med.logs || med.logs.length === 0) continue;
    
    // Sort logs descending by date/time
    const sortedLogs = [...med.logs].sort((a, b) => new Date(`${b.date}T${b.time || '12:00'}`) - new Date(`${a.date}T${a.time || '12:00'}`));
    let consecutiveMissed = 0;

    for (const log of sortedLogs) {
      if (log.status === 'missed') {
        consecutiveMissed++;
      } else if (log.status === 'taken') {
        break;
      }
    }

    if (consecutiveMissed >= thresholdConsecutive) {
      alerts.push({
        id: `ALT-${Date.now()}-${med.id}`,
        patientId: patient.id,
        patientName: patient.name,
        type: "Repeated Medication Adherence Failure",
        severity: med.critical ? "critical" : "warning",
        triggeringParameter: med.name,
        currentValue: `${consecutiveMissed} Consecutive Missed Doses`,
        previousValue: "Prescribed regimen",
        trendSummary: `Patient missed ${consecutiveMissed} sequential doses of ${med.name} (${med.dosage}). High post-discharge non-adherence risk.`,
        timestamp: new Date().toISOString(),
        status: "new",
        recommendedAction: `Care coordinator follow-up call to assess barriers to medication adherence for ${med.name}.`
      });
    }
  }

  return alerts;
}
