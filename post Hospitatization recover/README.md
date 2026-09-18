# Post-Hospitalization Recovery Platform

A full-stack prototype for post-hospitalization monitoring, patient check-ins, medication tracking, follow-up management, risk prediction, and clinical decision support.

> This project is a prototype that uses synthetic data. It is not a substitute for professional medical diagnosis or treatment.

## Features

- Patient dashboard with daily health check-ins and recovery history
- Medication tracking and dose logging
- Patient and care-team messaging
- Risk alerts, emergency escalation, and follow-up management
- Admin and clinician dashboards
- Disease database exploration and age-based recovery analytics
- HealthAssist AI chatbot
- Express API backed by local JSON data and risk-analysis services

## Requirements

- Node.js 18 or newer
- npm

### Optional Environment Configuration

Google Sign-In requires a Google OAuth web client ID. Configure the same client ID for the frontend and backend before using the Google button:

```powershell
$env:VITE_GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com"
```

Any verified Gmail account can create or sign into a Patient account through Google. Doctor and Admin Google access still requires a pre-registered healthcare staff account; Google cannot grant staff privileges.

### Windows PowerShell Note

If PowerShell reports that `npm.ps1` cannot be loaded because script execution is disabled, use `npm.cmd` instead:

```powershell
npm.cmd install
```

You can also enable locally installed PowerShell scripts for your Windows user account:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Restart PowerShell after changing the policy, then use the regular `npm` commands.

## Getting Started

Install dependencies for both applications from the repository root:

```bash
cd server
npm install
cd ../client
npm install
```

Start the backend in one terminal:

```bash
npm run server
```

The API runs at `http://localhost:5000` by default. Verify it with:

```text
http://localhost:5000/api/health
```

Start the frontend in a second terminal:

```bash
npm run client
```

Vite will print the local development URL, normally `http://localhost:5173`.

## Frontend

The frontend is a React 18 application built with Vite. It provides separate experiences for patients and administrators or clinicians.

### Frontend Responsibilities

- Render the landing page and authentication flow
- Display patient dashboards, daily check-ins, health history, medications, messages, and profile data
- Provide admin dashboards for patient monitoring, alerts, follow-ups, disease databases, age analytics, and threshold configuration
- Display risk badges, vital charts, notifications, emergency actions, and the HealthAssist chatbot
- Store the authentication token in browser local storage and attach it to API requests
- Call the backend through the shared API client in `client/src/services/api.js`

### Frontend Structure

| Directory                   | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `client/src/components/`    | Shared navigation, cards, charts, alerts, chatbot, and modal components |
| `client/src/pages/patient/` | Patient-facing screens and workflows                                    |
| `client/src/pages/admin/`   | Admin and clinician screens and workflows                               |
| `client/src/context/`       | Shared authentication state and user role handling                      |
| `client/src/services/`      | Functions for communicating with the backend API                        |
| `client/src/index.css`      | Global application styles                                               |

Run the frontend directly from its directory:

```bash
cd client
npm run dev
```

The frontend uses `/api` as its primary API path and falls back to `http://localhost:5000/api` when the development proxy is unavailable.

When `VITE_GOOGLE_CLIENT_ID` is configured, the login screen also displays Google Identity Services. Google authentication is optional; the existing email/password login remains available.

## Backend

The backend is an Express server that exposes the REST API used by the frontend. It runs on port `5000` by default and supports CORS for local frontend development.

### Backend Responsibilities

- Authenticate users and return role-specific access information
- Manage patients, check-ins, medications, messages, alerts, and follow-ups
- Provide emergency and pre-hospital triage workflows
- Expose disease database summaries and raw synthetic records
- Calculate age-based recovery analytics and patient baselines
- Manage configurable monitoring thresholds
- Process HealthAssist chatbot requests
- Run risk and alert evaluation services against the local data store

### Backend Structure

| Directory or file                | Purpose                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| `server/server.js`               | Express app setup, middleware, route registration, and server startup |
| `server/routes/`                 | API route modules grouped by feature                                  |
| `server/services/db.js`          | Local JSON data access                                                |
| `server/services/riskEngine.js`  | Risk evaluation and prediction logic                                  |
| `server/services/alertEngine.js` | Alert generation and monitoring logic                                 |
| `server/ai_engine/`              | Prediction scripts and model artifacts                                |
| `server/data/store.json`         | Prototype data storage                                                |

Run the backend directly from its directory:

```bash
cd server
npm start
```

For automatic restart during development:

```bash
cd server
npm run dev
```

The health check is available at `GET /api/health` and returns the API status and timestamp.

### Authorization and Privacy

Protected clinical API routes require a Bearer JWT. Patients can access only their own profile, reports, check-ins, medications, alerts, messages, follow-ups, schedules, and chatbot context. Doctors can access only patients assigned to their doctor ID. Administrators can access system-wide data, while threshold changes and database reset remain admin-only.

Administrators can change a patient assignment with `PUT /api/assignments/patients/:patientId/doctor`. The server validates both records and updates the patient’s assigned doctor; doctors cannot change assignments.

### Monitoring Schedules

`GET /api/monitoring/:patientId` generates an age-, disease-, risk-, and device-aware monitoring plan using the existing AI output shape. Overlapping measurements from multiple diseases are combined. Assigned doctors or administrators can save a reviewed override with `PUT /api/monitoring/:patientId`; the patient dashboard then labels it `Doctor Reviewed`.

### Excel Append Storage

Each submitted health check-in is appended to `server/data/clinical_records.xlsx`. Existing rows are read first and preserved; new records are written after the last populated row. The append-only endpoint is also available at `POST /api/records` for authenticated patient or assigned-care-team submissions.

## Available Root Commands

| Command          | Description                             |
| ---------------- | --------------------------------------- |
| `npm run server` | Start the Express API                   |
| `npm run client` | Start the Vite development server       |
| `npm run build`  | Create a production build of the client |

The frontend can also be run directly from `client/` with `npm run dev`. The backend supports `npm run dev` from `server/` for Node watch mode.

## Project Structure

```text
client/              React and Vite frontend
  src/components/    Shared UI components
  src/pages/         Patient, admin, and pre-hospital workflows
  src/services/      API client
server/              Express backend
  routes/             REST API route handlers
  services/           Risk, alert, database, and dataset services
  ai_engine/          Risk prediction scripts and model artifacts
  data/               Local JSON data store
```

## API

The API is mounted under `/api` and includes:

- `/api/auth`
- `/api/patients`
- `/api/checkins`
- `/api/medications`
- `/api/alerts`
- `/api/followups`
- `/api/messages`
- `/api/config`
- `/api/emergency`
- `/api/prehospital`
- `/api/diseases`
- `/api/analytics`
- `/api/chatbot`

The server uses local JSON storage for this prototype. Data and configuration are not intended for production use.

## Production Build

Build the frontend with:

```bash
npm run build
```

The generated static files are written to `client/dist/`.
