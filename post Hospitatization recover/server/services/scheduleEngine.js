const diseaseRequirements = {
  diabetes: [
    [
      "Blood glucose",
      "Tracks glucose control around meals and medication.",
      true,
    ],
    ["Meals", "Connects glucose readings with food intake.", false],
    [
      "Medication",
      "Confirms prescribed diabetes treatment was followed.",
      false,
    ],
    ["Weight", "Helps identify longer-term metabolic or fluid changes.", true],
    [
      "Symptoms",
      "Captures warning symptoms such as shakiness or unusual thirst.",
      false,
    ],
  ],
  hypertension: [
    ["Blood pressure", "Tracks pressure against the patient baseline.", true],
    ["Heart rate", "Adds context to blood-pressure changes.", true],
    [
      "Symptoms",
      "Captures dizziness, headache, chest discomfort, or weakness.",
      false,
    ],
  ],
  "heart disease": [
    ["Blood pressure", "Tracks cardiovascular pressure response.", true],
    ["Heart rate", "Tracks pulse changes during recovery.", true],
    ["SpO2", "Checks oxygen saturation when clinically indicated.", true],
    ["Weight", "Helps identify fluid-retention changes.", true],
    [
      "Symptoms",
      "Captures chest discomfort, breathlessness, or swelling.",
      false,
    ],
  ],
  asthma: [
    ["Breathing symptoms", "Tracks changes in breathing and wheezing.", false],
    [
      "SpO2",
      "Checks oxygen saturation when a pulse oximeter is available.",
      true,
    ],
    ["Peak flow", "Tracks airway flow when prescribed and available.", true],
    ["Heart rate", "Adds context to respiratory symptoms.", true],
  ],
  "chronic kidney disease": [
    [
      "Blood pressure",
      "Tracks pressure changes relevant to kidney recovery.",
      true,
    ],
    ["Weight", "Helps identify fluid-retention changes.", true],
    [
      "Urine changes",
      "Captures changes in output, color, or foaminess.",
      false,
    ],
    ["Blood glucose", "Included when diabetes is also selected.", true],
    [
      "Symptoms",
      "Captures swelling, fatigue, nausea, or flank discomfort.",
      false,
    ],
  ],
};

const normalizeDiseases = (patient) => {
  const values =
    Array.isArray(patient.diseases) && patient.diseases.length
      ? patient.diseases
      : [patient.disease || patient.diseaseCategory || "Hypertension"];
  return [
    ...new Set(values.map((value) => String(value).toLowerCase().trim())),
  ];
};

const ageGroupFor = (age) => {
  const numericAge = Number(age) || 0;
  if (numericAge <= 17) return "Child";
  if (numericAge >= 60) return "Senior Citizen";
  return "Adult";
};

export const buildMonitoringSchedule = (patient, options = {}) => {
  const diseases = normalizeDiseases(patient);
  const ageGroup = ageGroupFor(patient.age);
  const riskLevel = patient.currentRiskLevel || "Low Risk";
  const devices = new Set(
    (options.availableDevices || patient.availableDevices || []).map((device) =>
      String(device).toLowerCase()
    )
  );
  const requirements = new Map();

  diseases.forEach((disease) => {
    const matches =
      diseaseRequirements[disease] || diseaseRequirements.hypertension;
    matches.forEach(([parameter, reason, deviceRequired]) => {
      if (!requirements.has(parameter))
        requirements.set(parameter, { parameter, reason, deviceRequired });
    });
  });

  const highRisk = riskLevel.toLowerCase().includes("high");
  const childNote =
    ageGroup === "Child"
      ? " Follow the pediatric clinician's instructions."
      : "";
  const interval = highRisk
    ? "Morning and evening"
    : ageGroup === "Senior Citizen"
    ? "Daily, as clinically directed"
    : "Daily";
  const plan = [...requirements.values()].map((item) => {
    const normalizedParameter = item.parameter.toLowerCase();
    const hasDevice = [...devices].some(
      (device) =>
        normalizedParameter.includes(device) ||
        device.includes(normalizedParameter)
    );
    const deviceRequired = item.deviceRequired && !hasDevice;
    return {
      time: interval,
      parameter: item.parameter,
      reason: `${item.reason}${childNote}`,
      device_required: deviceRequired,
      priority:
        highRisk &&
        ["blood pressure", "heart rate", "spo2", "blood glucose"].includes(
          normalizedParameter
        )
          ? "high"
          : "normal",
    };
  });

  const override =
    options.doctorOverride || patient.doctorMonitoringSchedule || null;
  const monitoringPlan = Array.isArray(override?.monitoring_plan)
    ? override.monitoring_plan
    : plan;

  return {
    patient_profile: { age_group: ageGroup, diseases, risk_level: riskLevel },
    monitoring_plan: monitoringPlan,
    daily_summary:
      override?.daily_summary ||
      `Personalized ${interval.toLowerCase()} monitoring plan for ${ageGroup.toLowerCase()} recovery.`,
    additional_check_conditions: highRisk
      ? [
          "Repeat measurements if symptoms worsen or a reading is outside the clinician-defined range.",
        ]
      : ["Submit an additional report if symptoms worsen."],
    doctor_review_required:
      Boolean(override) || ageGroup === "Child" || highRisk,
    emergency_warning:
      "Seek urgent medical care for severe breathing difficulty, persistent chest discomfort, fainting, sudden weakness, or other emergency symptoms.",
    source: override ? "doctor_override" : "ai_suggestion",
  };
};
