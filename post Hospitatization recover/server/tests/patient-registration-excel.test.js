import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { savePatientToExcel } from "../services/excelStorage.js";

test("savePatientToExcel creates a workbook and persists the patient row", () => {
  const outputDir = path.resolve("./tmp-test-output");
  const workbookPath = path.join(outputDir, "patient_registry.xlsx");

  if (fs.existsSync(workbookPath)) {
    fs.rmSync(workbookPath, { force: true });
  }

  const patient = {
    id: "PMR-TEST-0001",
    name: "Jane Test Patient",
    age: 56,
    gender: "Female",
    phone: "+1 (555) 777-0001",
    email: "jane.test@example.com",
    address: "101 Test Street, Metro City",
    emergencyContactName: "John Test",
    emergencyContactPhone: "+1 (555) 777-0002",
    bloodGroup: "A+",
    diagnosis: "Post-Discharge Recovery",
    hospitalName: "St. Jude Metropolitan Hospital",
    doctorName: "Dr. Sarah Jenkins, MD",
    doctorId: "DOC-101",
    admissionDate: "2026-09-01",
    dischargeDate: "2026-09-10",
    followUpDate: "2026-09-17",
    recoveryStatus: "Initial Monitoring",
    currentRiskLevel: "Low Risk",
    riskScore: 20,
  };

  try {
    const result = savePatientToExcel(patient, { workbookPath });

    assert.equal(result.excelSaved, true);
    assert.equal(result.patientId, patient.id);
    assert.ok(fs.existsSync(workbookPath), "Excel file should exist after saving");

    const workbook = XLSX.readFile(workbookPath);
    const sheetName = workbook.SheetNames.find((name) => name === "Patient Registry") || workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });
    const savedRow = rows.find((row) => String(row["Patient ID"]) === patient.id);

    assert.ok(savedRow, "saved patient row should exist in sheet");
    assert.equal(savedRow["Full Name"], patient.name);
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
});

test("savePatientToExcel rejects invalid workbook destinations", async () => {
  const patient = {
    id: "PMR-TEST-0002",
    name: "Broken Path Patient",
    age: 40,
    gender: "Other",
    phone: "+1 (555) 777-0003",
    email: "broken.path@example.com",
    address: "999 Invalid Lane",
    emergencyContactName: "No Contact",
    emergencyContactPhone: "+1 (555) 777-0004",
    bloodGroup: "O+",
    diagnosis: "Test Failure",
    hospitalName: "St. Jude Metropolitan Hospital",
    doctorName: "Dr. Sarah Jenkins, MD",
    doctorId: "DOC-101",
    admissionDate: "2026-09-05",
    dischargeDate: "2026-09-12",
    followUpDate: "2026-09-19",
    recoveryStatus: "Initial Monitoring",
    currentRiskLevel: "Low Risk",
    riskScore: 21,
  };

  const invalidPath = path.resolve("./data/readonly-marker.txt/invalid_registry.xlsx");
  fs.mkdirSync(path.dirname(invalidPath), { recursive: true });
  fs.writeFileSync(path.dirname(invalidPath), "not a directory");

  try {
    await assert.rejects(
      () => savePatientToExcel(patient, { workbookPath: invalidPath }),
      /Excel report could not be saved|
      patient row not found in Excel workbook after save|
      EEXIST|ENOTDIR|EISDIR/
    );
  } finally {
    try {
      fs.unlinkSync(path.dirname(invalidPath));
    } catch {
      // no-op: cleanup is best effort
    }
  }
});
