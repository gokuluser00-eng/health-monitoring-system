const PRIMARY_API = "/api";
const FALLBACK_API = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("pmr_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${PRIMARY_API}${endpoint}`, config);
    if (!res.ok) {
      if (res.status === 404 || res.status === 502 || res.status === 504) {
        throw new Error(`Proxy error ${res.status}`);
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || `HTTP error! status: ${res.status}`);
    }
    return await res.json().catch(() => ({}));
  } catch (proxyError) {
    try {
      const fallbackRes = await fetch(`${FALLBACK_API}${endpoint}`, config);
      const fallbackData = await fallbackRes.json().catch(() => ({}));
      if (!fallbackRes.ok) {
        throw new Error(
          fallbackData.error || fallbackData.message || `HTTP error! status: ${fallbackRes.status}`
        );
      }
      return fallbackData;
    } catch (fallbackError) {
      console.error(
        `API Connection failed for ${endpoint}:`,
        proxyError,
        fallbackError
      );
      throw proxyError;
    }
  }
};

export const api = {
  // Auth
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  googleLogin: (credential, role = "patient") =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential, role }),
    }),
  register: (patientData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(patientData),
    }),

  // Patients
  getPatients: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/patients${query ? `?${query}` : ""}`);
  },
  getPatientById: (id) => request(`/patients/${id}`),
  updatePatient: (id, updates) =>
    request(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Checkins
  submitCheckin: (checkinData) =>
    request("/checkins", { method: "POST", body: JSON.stringify(checkinData) }),
  getCheckinHistory: (patientId) => request(`/checkins/${patientId}`),

  // Medications
  getMedications: (patientId) => request(`/medications/${patientId}`),
  logMedicationDose: (medId, logData) =>
    request(`/medications/${medId}/log`, {
      method: "POST",
      body: JSON.stringify(logData),
    }),
  prescribeMedication: (medData) =>
    request("/medications", { method: "POST", body: JSON.stringify(medData) }),

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/alerts${query ? `?${query}` : ""}`);
  },
  updateAlertStatus: (id, updateData) =>
    request(`/alerts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  // Follow-ups
  getFollowups: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/followups${query ? `?${query}` : ""}`);
  },
  scheduleFollowup: (followupData) =>
    request("/followups", {
      method: "POST",
      body: JSON.stringify(followupData),
    }),
  updateFollowup: (id, updates) =>
    request(`/followups/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  // Messages
  getMessages: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/messages${query ? `?${query}` : ""}`);
  },
  sendMessage: (msgData) =>
    request("/messages", { method: "POST", body: JSON.stringify(msgData) }),
  markMessageRead: (id) => request(`/messages/${id}/read`, { method: "PUT" }),

  // Config & Stats
  getStats: () => request("/config/stats"),
  getThresholds: () => request("/config/thresholds"),
  updateThresholds: (thresholds) =>
    request("/config/thresholds", {
      method: "PUT",
      body: JSON.stringify(thresholds),
    }),
  resetDatabase: () => request("/config/reset", { method: "POST" }),

  // Emergency
  triggerEmergency: (emergencyData) =>
    request("/emergency/trigger", {
      method: "POST",
      body: JSON.stringify(emergencyData),
    }),

  // Pre-Hospital Module
  prehospitalTriage: (triageData) =>
    request("/prehospital/triage", {
      method: "POST",
      body: JSON.stringify(triageData),
    }),
  admitDischargePatient: (admitData) =>
    request("/prehospital/admit-discharge", {
      method: "POST",
      body: JSON.stringify(admitData),
    }),

  // Five Disease Databases & 1,000 Records
  getDiseasesSummary: () => request("/diseases/summary"),
  getRaw1000Records: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/diseases/raw-1000${query ? `?${query}` : ""}`);
  },
  getDiseaseDb: (disease, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/diseases/${disease}${query ? `?${query}` : ""}`);
  },

  // Age Analytics & Baseline
  getAgeDiseaseMatrix: () => request("/analytics/age-disease-matrix"),
  getAgeGroups: () => request("/analytics/age-groups"),
  updateAgeGroups: (config) =>
    request("/analytics/age-groups", {
      method: "POST",
      body: JSON.stringify(config),
    }),
  getAgeWiseAnalytics: (groupKey) => request(`/analytics/age-wise/${groupKey}`),
  getMonitoringGaps: (hours = 36) =>
    request(`/analytics/monitoring-gaps?hours=${hours}`),
  getPatientBaseline: (patientId) =>
    request(`/analytics/baseline/${patientId}`),

  // HealthAssist AI Chatbot
  sendChatbotMessage: (msgData) =>
    request("/chatbot/message", {
      method: "POST",
      body: JSON.stringify(msgData),
    }),
  getMonitoringSchedule: (patientId) => request(`/monitoring/${patientId}`),
  updateMonitoringSchedule: (patientId, schedule) =>
    request(`/monitoring/${patientId}`, {
      method: "PUT",
      body: JSON.stringify(schedule),
    }),
  appendClinicalRecord: (record) =>
    request("/records", { method: "POST", body: JSON.stringify(record) }),
  assignPatientDoctor: (patientId, doctorId) =>
    request(`/assignments/patients/${patientId}/doctor`, {
      method: "PUT",
      body: JSON.stringify({ doctorId }),
    }),
};
