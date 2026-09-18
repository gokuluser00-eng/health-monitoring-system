import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKBOOK_FILE = path.resolve(__dirname, "../data/clinical_records.xlsx");
const PATIENT_REGISTRY_FILE = path.resolve(
  __dirname,
  "../data/patient_registry.xlsx"
);

const REQUIRED_COLUMNS = [
  "Timestamp",
  "Patient ID",
  "Patient Name",
  "Doctor ID",
  "Disease",
  "Age Group",
  "Risk Level",
  "Blood Glucose",
  "Blood Pressure",
  "Heart Rate",
  "SpO2",
  "Temperature",
  "Weight",
  "Symptoms",
  "Medication",
  "AI Risk Result",
  "Doctor Instructions",
];

const PATIENT_HEADERS = [
  "Patient ID",
  "Full Name",
  "Age",
  "Gender",
  "Phone",
  "Email",
  "Address",
  "Emergency Contact Name",
  "Emergency Contact Phone",
  "Blood Group",
  "Diagnosis",
  "Hospital Name",
  "Doctor Name",
  "Doctor ID",
  "Admission Date",
  "Discharge Date",
  "Follow-Up Date",
  "Recovery Status",
  "Current Risk Level",
  "Risk Score",
];

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const mapPatientToRegistryRow = (patient) =>
  PATIENT_HEADERS.map((header) => {
    const keyMap = {
      "Patient ID": "id",
      "Full Name": "name",
      "Age": "age",
      "Gender": "gender",
      "Phone": "phone",
      "Email": "email",
      "Address": "address",
      "Emergency Contact Name": "emergencyContactName",
      "Emergency Contact Phone": "emergencyContactPhone",
      "Blood Group": "bloodGroup",
      "Diagnosis": "diagnosis",
      "Hospital Name": "hospitalName",
      "Doctor Name": "doctorName",
      "Doctor ID": "doctorId",
      "Admission Date": "admissionDate",
      "Discharge Date": "dischargeDate",
      "Follow-Up Date": "followUpDate",
      "Recovery Status": "recoveryStatus",
      "Current Risk Level": "currentRiskLevel",
      "Risk Score": "riskScore",
    };

    return normalizeCellValue(patient[keyMap[header]] ?? "");
  });

const resolveWorkbookPath = (targetPath) => path.resolve(targetPath || PATIENT_REGISTRY_FILE);

export const savePatientToExcel = (patient, options = {}) => {
  const filePath = resolveWorkbookPath(options.workbookPath || PATIENT_REGISTRY_FILE);
  const sheetName = "Patient Registry";

  console.log("PATIENT_CREATE_STARTED");
  console.log("EXCEL_UPDATE_STARTED");
  console.log("EXCEL_FILE_PATH:", filePath);

  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log("OUTPUT_DIR_CREATED:", directory);
  }

  let workbook;
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    console.log("EXCEL_WORKBOOK_OPENED");
  } else {
    workbook = XLSX.utils.book_new();
  }

  let rows = [];
  const targetSheet = workbook.Sheets?.[sheetName];
  if (targetSheet) {
    rows = XLSX.utils.sheet_to_json(targetSheet, { header: 1, defval: "" });
  }

  const existingHeaders = Array.isArray(rows[0]) ? rows[0].filter(Boolean) : [];
  const headers = [...new Set([...existingHeaders, ...PATIENT_HEADERS])];
  const dataRows = Array.isArray(rows.slice(1)) ? rows.slice(1) : [];
  const rowToAppend = mapPatientToRegistryRow(patient);

  const sheet = XLSX.utils.aoa_to_sheet([
    headers,
    ...dataRows,
    rowToAppend,
  ]);

  if (workbook.SheetNames.includes(sheetName)) {
    workbook.Sheets[sheetName] = sheet;
  } else {
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  }

  try {
    XLSX.writeFile(workbook, filePath);
  } catch (error) {
    console.error("EXCEL_SAVE_FAILED");
    console.error("ERROR:", error?.message || error);
    console.error("FILE_PATH:", filePath);
    throw new Error("Patient creation failed because the Excel report could not be saved");
  }

  const existsAfterWrite = fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  if (!existsAfterWrite) {
    console.error("EXCEL_SAVE_FAILED");
    console.error("ERROR:", "Excel file verification failed after saving");
    console.error("FILE_PATH:", filePath);
    throw new Error("Patient creation failed because the Excel report could not be saved");
  }

  try {
    const savedWorkbook = XLSX.readFile(filePath);
    const savedSheet = savedWorkbook.Sheets[sheetName] || savedWorkbook.Sheets[savedWorkbook.SheetNames[0]];
    const savedRows = savedSheet
      ? XLSX.utils.sheet_to_json(savedSheet, { header: 1, defval: "" })
      : [];
    const patientIdIndex = savedRows[0]?.findIndex(
      (header) => String(header).trim() === "Patient ID"
    );

    const patientRowFound = savedRows.some((row) => {
      if (!Array.isArray(row)) return false;
      return patientIdIndex >= 0 && String(row[patientIdIndex] || "") === String(patient.id);
    });

    if (!patientRowFound) {
      throw new Error("Patient row not found in Excel workbook after save.");
    }
  } catch (error) {
    console.error("EXCEL_SAVE_FAILED");
    console.error("ERROR:", error?.message || error);
    console.error("FILE_PATH:", filePath);
    throw new Error("Patient creation failed because the Excel report could not be saved");
  }

  console.log("EXCEL_ROW_ADDED");
  console.log("EXCEL_SAVE_SUCCESS");
  console.log("EXCEL_FILE_VERIFICATION_SUCCESS");
  console.log("PATIENT_CREATE_COMPLETED");

  return {
    success: true,
    excelSaved: true,
    patientId: patient.id,
    filePath,
    sheetName,
  };
};

export const appendClinicalRecord = (record) => {
  const directory = path.dirname(WORKBOOK_FILE);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });

  let workbook;
  let rows = [];
  if (fs.existsSync(WORKBOOK_FILE)) {
    workbook = XLSX.readFile(WORKBOOK_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = sheet
      ? XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })
      : [];
  } else {
    workbook = XLSX.utils.book_new();
  }

  const existingHeaders = Array.isArray(rows[0]) ? rows[0].filter(Boolean) : [];
  const headers = [
    ...new Set([
      ...existingHeaders,
      ...REQUIRED_COLUMNS,
      ...Object.keys(record),
    ]),
  ];
  const dataRows = rows.length > 0 ? rows.slice(1) : [];
  const nextRow = headers.map((header) => record[header] ?? "");
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows, nextRow]);

  if (workbook.SheetNames.length > 0) {
    workbook.Sheets[workbook.SheetNames[0]] = sheet;
  } else {
    XLSX.utils.book_append_sheet(workbook, sheet, "Clinical Records");
  }

  XLSX.writeFile(workbook, WORKBOOK_FILE);
  return { file: WORKBOOK_FILE, row: dataRows.length + 2, columns: headers };
};
