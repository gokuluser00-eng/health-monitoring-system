import express from 'express';
import { db } from '../services/db.js';

const router = express.Router();

// GET /api/diseases/summary
router.get('/summary', (req, res) => {
  const dbs = db.getAllDiseaseDatabases();
  const raw = db.getRaw1000Records();

  const summary = {
    totalRecords: raw.length,
    databases: [
      {
        id: 'hypertension',
        name: 'Hypertension Database',
        recordCount: (dbs.hypertension || []).length,
        parameters: ['Blood Pressure', 'Heart Rate', 'Weight', 'Medication', 'Meals', 'SpO2'],
        description: 'Hemodynamic telemetry, antihypertensive therapy response, and volume monitoring.'
      },
      {
        id: 'diabetes',
        name: 'Diabetes Database',
        recordCount: (dbs.diabetes || []).length,
        parameters: ['Blood Glucose', 'Blood Pressure', 'Heart Rate', 'Weight', 'Meals', 'Medication', 'SpO2'],
        description: 'Postprandial & fasting glycemic curves, meal logging, and insulin adherence.'
      },
      {
        id: 'heart_disease',
        name: 'Heart Disease Database',
        recordCount: (dbs.heart_disease || []).length,
        parameters: ['Blood Pressure', 'Heart Rate', 'Weight', 'Medication', 'SpO2', 'Symptoms'],
        description: 'Cardiac workload indices, fluid retention tracking, and ischemic symptom monitoring.'
      },
      {
        id: 'asthma',
        name: 'Asthma Database',
        recordCount: (dbs.asthma || []).length,
        parameters: ['SpO2', 'Heart Rate', 'Peak Flow', 'Medication', 'Blood Pressure', 'Symptoms'],
        description: 'Airflow obstruction telemetry, bronchodilator frequency, and nocturnal exacerbation tracking.'
      },
      {
        id: 'ckd',
        name: 'Chronic Kidney Disease Database',
        recordCount: (dbs.ckd || []).length,
        parameters: ['Blood Pressure', 'Heart Rate', 'Weight', 'Medication', 'SpO2', 'Urine Changes'],
        description: 'Fluid overload detection, nephrotoxic avoidance, and urinary output characteristics.'
      }
    ]
  };

  res.json(summary);
});

// GET /api/diseases/raw-1000
router.get('/raw-1000', (req, res) => {
  const { disease, search, page = 1, limit = 50 } = req.query;
  let records = db.getRaw1000Records();

  if (disease && disease !== 'All') {
    records = records.filter(r => r.Disease.toLowerCase() === disease.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    records = records.filter(r => 
      r.Patient_ID.toLowerCase().includes(q) ||
      r.Patient_Name.toLowerCase().includes(q) ||
      (r.Symptoms && r.Symptoms.toLowerCase().includes(q))
    );
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const total = records.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = records.slice(start, start + limitNum);

  res.json({
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    records: paginated
  });
});

// Helper for specific disease database route
const handleDiseaseDbRequest = (req, res, dbKey) => {
  const records = db.getDiseaseDatabase(dbKey);
  const { search, page = 1, limit = 50 } = req.query;
  let filtered = [...records];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.patientId.toLowerCase().includes(q) ||
      r.patientName.toLowerCase().includes(q) ||
      (r.symptoms && r.symptoms.toLowerCase().includes(q))
    );
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(start, start + limitNum);

  res.json({
    disease: dbKey,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    records: paginated
  });
};

router.get('/hypertension', (req, res) => handleDiseaseDbRequest(req, res, 'hypertension'));
router.get('/diabetes', (req, res) => handleDiseaseDbRequest(req, res, 'diabetes'));
router.get('/heart-disease', (req, res) => handleDiseaseDbRequest(req, res, 'heart_disease'));
router.get('/asthma', (req, res) => handleDiseaseDbRequest(req, res, 'asthma'));
router.get('/ckd', (req, res) => handleDiseaseDbRequest(req, res, 'ckd'));

// GET /api/diseases/export-csv/:target
// Generates CSV download for Excel / Sheets integration (Section 6)
router.get('/export-csv/:target', (req, res) => {
  const { target } = req.params;
  let records = [];
  let filename = 'synthetic_dataset.csv';

  if (target === 'all' || target === 'raw1000') {
    records = db.getRaw1000Records();
    filename = '1000_synthetic_patient_records.csv';
  } else {
    records = db.getDiseaseDatabase(target);
    filename = `${target}_disease_database.csv`;
  }

  if (!records || records.length === 0) {
    return res.status(404).send("No records available to export");
  }

  // Generate CSV string
  const headers = Object.keys(records[0]);
  const csvRows = [headers.join(',')];

  records.forEach(row => {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvContent);
});

export default router;
