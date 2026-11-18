# Candidex — Full Technical Notes & Syllabus Alignment Guide

**Project**: Candidex (Candidate Experience & Applicant Tracking System)  
**Author / Engineering Stack**: React 18, Vite, Tailwind CSS, Node.js, Express.js, MongoDB Atlas (Mongoose), Multer, JWT  
**Role Architecture**: Candidate, Recruiter, Platform Administrator  

---

## 📑 Table of Contents
1. [Executive Project Overview](#1-executive-project-overview)
2. [Complete Web Development Syllabus Alignment (Units 1–5)](#2-complete-web-development-syllabus-alignment)
   - [Unit 1: Web Fundamentals](#unit-1-web-fundamentals)
   - [Unit 2: Node.js Fundamentals & Core Modules](#unit-2-nodejs-fundamentals--core-modules)
   - [Unit 3 & 4: Frontend Development Basics, Project & Debugging](#unit-3--4-frontend-development-basics-project--debugging)
   - [Unit 5: Express.js & REST APIs](#unit-5-expressjs--rest-apis)
3. [Database Architecture & Compound Indexes](#3-database-architecture--compound-indexes)
4. [Recruitment Pipeline State Machine](#4-recruitment-pipeline-state-machine)
5. [Security & IDOR Prevention Architecture](#5-security--idor-prevention-architecture)
6. [Complete REST API Specification](#6-complete-rest-api-specification)
7. [Placement & Technical Interview Question Bank](#7-placement--technical-interview-question-bank)

---

## 1. Executive Project Overview

**Candidex** is an enterprise-grade, two-sided Applicant Tracking System (ATS) and Job Portal engineered to manage the entire technical hiring lifecycle:

```
[Candidate View]                                  [Recruiter Workspace]
- Explore Jobs with Faceted Search               - KPI Dashboard (Active Jobs, Pipeline)
- Filter by Role, Mode, Exp, CTC, Skills         - Job Management (Create, Edit, Close)
- One-Click Apply with Resume & Note             - Candidate Dossier Review
- Visual Pipeline Progress Stepper               - State Machine Stage Transitions
- Profile Builder (0-100% Score)                 - Internal Evaluation Notes
- Document & Resume Uploads                      - IDOR-Protected Document Streaming
        │                                                  │
        └─────────────────► [MongoDB Atlas] ◄──────────────┘
                                   ▲
                                   │
                      [Platform Administrator]
                      - Aggregation Pipeline Analytics
                      - Global Job Moderation
                      - User Directory & Access Control
```

### Key Technical Pillars:
1. **Multi-Role RBAC**: Strict separation of concerns across route guards and database queries.
2. **Preventing IDOR (Insecure Direct Object Reference)**: Private documents are streamed through access-controlled endpoints verifying authorization before execution.
3. **Compound Unique Indexing**: Guaranteed duplicate application prevention at the database layer.
4. **Finite State Machine**: Enforces valid recruitment stage transitions server-side.
5. **MongoDB Aggregation Pipelines**: Live funnel stage counts and work mode analytics.

---

## 2. Complete Web Development Syllabus Alignment

This section provides in-depth technical notes and code mapping for every topic from your syllabus.

---

### Unit 1: Web Fundamentals
**Allocation: 18 Hours | 15% Weightage**

#### 1. HTML, CSS, Web Basics
- **Client-Server Architecture**: The browser (client) initiates HTTP requests to the Node.js/Express server on port 5000, which queries MongoDB and returns structured JSON responses.
- **Semantic HTML5**: Used throughout `index.html` and React components (`<header>`, `<nav>`, `<main>`, `<aside>`, `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<form>`, `<label>`, `<input>`).
- **CSS Box Model & Utility Architecture**: Configured via Tailwind CSS in [`frontend/tailwind.config.js`](file:///e:/Job%20Application/frontend/tailwind.config.js) and [`frontend/src/index.css`](file:///e:/Job%20Application/frontend/src/index.css). Utilizes a curated Nordic Deep Teal palette (`#0d9488`, `#042f2e`, `#f8fafc`).

#### 2. Developer Tools & Debugging
- Inspected network requests, request/response headers (`Authorization: Bearer <token>`, `Content-Type: application/json`), and DOM trees using the browser agent.

#### 3. Git / GitHub Setup
- Initialized local Git repository, created comprehensive [`.gitignore`](file:///e:/Job%20Application/.gitignore) ignoring `node_modules`, `dist/`, `.env`, and `uploads/`.
- Committed clean atomic milestones (`init`, `feat: rebrand to Candidex`).

#### 4. JavaScript Fundamentals, DOM & Events
- **DOM & Synthetic Events**: Handled via React event listeners:
  - `onClick`: Triggers modals, persona switching, and bookmark toggling.
  - `onChange`: Captures search queries, filter selections, and resume file inputs.
  - `onSubmit`: Handles application submission, job creation, and profile updates.
  - `onKeyDown`: Listens for the `Escape` key in [`Modal.jsx`](file:///e:/Job%20Application/frontend/src/components/common/Modal.jsx) to close dialogs.

#### 5. ES6 Basics
- `const` and `let` for block-scoped immutability.
- Arrow functions (`const fetchJobs = async () => { ... }`).
- Destructuring assignment: `const { title, location, minExp } = req.body;`.
- Default parameters: `export const demoLogin = async (role = 'candidate') => { ... }`.
- Rest / Spread operators (`...req.body`, `...roles`, `[...prev, newSkill]`).
- Template literals: `` `Job "${title}" (ID: ${jobId}) marked as "${status}"` ``.

#### 6. Async JavaScript, Promises, Fetch API & `async/await`
- Asynchronous non-blocking operations throughout the application.
- Centralized fetch wrapper in [`frontend/src/api/client.js`](file:///e:/Job%20Application/frontend/src/api/client.js):
```javascript
export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('candidex_token');
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const response = await fetch(`/api${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};
```

#### 7. NPM, Node.js Basics, Modules & `package.json`
- Configured with `"type": "module"` in [`backend/package.json`](file:///e:/Job%20Application/backend/package.json) for native ES Module (`import`/`export`) support.
- Configured npm scripts:
  - `"dev"`: Runs `node --watch src/server.js` using Node v24 native file watching.
  - `"seed"`: Executes database initialization script `src/scripts/seed.js`.
  - `"start"`: Production server starter.

---

### Unit 2: Node.js Fundamentals & Core Modules
**Allocation: 20 Hours | 17% Weightage**

#### 1. Node.js Setup, Event Loop & Global Objects
- **Node.js Runtime**: Runs on Node.js v24.20.0 LTS.
- **Event Loop Mechanism**: Node executes JavaScript on a single thread. When performing I/O (such as MongoDB queries or file reads), Node offloads the operation to libuv thread pool workers, returning to the event queue via microtask and macrotask queues without blocking incoming HTTP requests.
- **Global Objects**: Leverages `process` (`process.env`, `process.uptime()`), `console`, `Buffer`, and `setTimeout`.

#### 2. CommonJS vs. ES Modules (`require` vs. `import`)
- Employs modern ECMAScript Modules (`import express from 'express';`, `export const connectDB = ...`).
- Bridges directory path resolution using `fileURLToPath`:
```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

#### 3. Core Modules: File System (`fs`) & Path (`path`)
- Implemented in [`backend/src/utils/fileHandler.js`](file:///e:/Job%20Application/backend/src/utils/fileHandler.js):
  - `path.resolve(__dirname, '../../uploads')`: Safely resolves cross-platform upload directory paths.
  - `fs.existsSync(UPLOAD_PATH)` & `fs.mkdirSync(UPLOAD_PATH, { recursive: true })`: Automatically creates upload storage directories on server boot.
  - `path.basename(filename)`: Sanitizes incoming filenames to prevent path traversal directory attacks.

#### 4. Streams & Buffers (Unit 2 Core)
- Implemented in [`backend/src/controllers/uploadController.js`](file:///e:/Job%20Application/backend/src/controllers/uploadController.js#L50-L105):
  - Rather than reading entire 2MB PDF files into memory with `fs.readFile()` (which degrades V8 heap memory under high concurrency), we use **Node.js Streams**:
```javascript
// High-efficiency, chunked stream directly to HTTP response buffer
const readStream = fs.createReadStream(filePath);
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
readStream.pipe(res);
```
- **Buffers**: Memory allocation chunks handled natively during stream piping without intermediate string conversions.

#### 5. HTTP Module & Server Creation
- In [`backend/src/server.js`](file:///e:/Job%20Application/backend/src/server.js#L70-L85):
```javascript
import http from 'http';
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`[Server] Candidex ATS API running on port ${PORT}`);
});
```

#### 6. Events & `EventEmitter` (Unit 2 Core)
- Implemented in [`backend/src/events/appEvents.js`](file:///e:/Job%20Application/backend/src/events/appEvents.js):
  - Demonstrates native Node.js event-driven architecture using `events.EventEmitter`:
```javascript
import { EventEmitter } from 'events';

class ApplicationEventEmitter extends EventEmitter {}
export const appEvents = new ApplicationEventEmitter();

// Event Listener 1: Application submission audit
appEvents.on('application:submitted', (data) => {
  console.log(`[Event: application:submitted] Candidate "${data.candidateName}" applied for "${data.jobTitle}"`);
});

// Event Listener 2: Application stage transition audit
appEvents.on('application:stageChanged', (data) => {
  console.log(`[Event: application:stageChanged] Status updated to "${data.newStage}" for "${data.jobTitle}"`);
});
```

#### 7. Process-Level Error Handling
- Unhandled rejections and uncaught exceptions captured globally in [server.js](file:///e:/Job%20Application/backend/src/server.js#L87-L95):
```javascript
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
});
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception] ${err.name}: ${err.message}`);
  process.exit(1);
});
```

---

### Unit 3 & 4: Frontend Development Basics, Project & Debugging
**Allocation: 18 Hours | 15% Weightage**

#### 1. Tailwind CSS Design System & Responsive Tokens
- Custom design system defined in [`frontend/tailwind.config.js`](file:///e:/Job%20Application/frontend/tailwind.config.js) with extended palette:
  - `brand-50` (`#f0fdfa`) to `brand-950` (`#042f2e`).
  - Font family set to Google Fonts *Inter*.
  - Accessible focus rings: `.focus-ring { @apply focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1; }`.

#### 2. Reusable Component Hierarchy
- **[`CandidexLogo.jsx`](file:///e:/Job%20Application/frontend/src/components/common/CandidexLogo.jsx)**: Custom geometric vector logo emblem.
- **[`Badge.jsx`](file:///e:/Job%20Application/frontend/src/components/common/Badge.jsx)**:
  - `StageBadge`: Color-coded status indicator (`applied`, `shortlisted`, `interview`, `offered`, `rejected`).
  - `StatusBadge`: Job status indicators (`active`, `closed`, `draft`).
  - `WorkModeBadge`: Work mode labels (`Remote`, `Hybrid`, `On-site`).
- **[`Modal.jsx`](file:///e:/Job%20Application/frontend/src/components/common/Modal.jsx)**: Reusable accessible modal with backdrop blur and escape key listener.
- **[`SkeletonLoader.jsx`](file:///e:/Job%20Application/frontend/src/components/common/SkeletonLoader.jsx)**: Shimmer skeleton cards and table rows for perceived performance.

#### 3. State Management & React Context
- Implemented in [`frontend/src/context/AuthContext.jsx`](file:///e:/Job%20Application/frontend/src/context/AuthContext.jsx):
  - Provides reactive user session, JWT storage, instant 1-click demo logins, logout, and saved job bookmarks.

#### 4. Logging & Debugging Node Apps
- Custom HTTP request logging middleware in [`backend/src/middleware/loggerMiddleware.js`](file:///e:/Job%20Application/backend/src/middleware/loggerMiddleware.js):
```javascript
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
    console.log(`[HTTP] ${method} ${originalUrl} ${color}${res.statusCode}\x1b[0m - ${duration}ms (IP: ${ip})`);
  });
  next();
};
```

---

### Unit 5: Express.js & REST APIs
**Allocation: 16 Hours | 14% Weightage**

#### 1. Express Setup & Middleware Chain
In [`backend/src/server.js`](file:///e:/Job%20Application/backend/src/server.js):
1. `cors()`: Cross-Origin Resource Sharing whitelist (`http://localhost:5173`).
2. `express.json()`: Body parsing for incoming application/json payloads.
3. `express.urlencoded({ extended: true })`: URL-encoded form data parsing.
4. `requestLogger`: Request timing & performance monitoring.
5. Modular API routers mounted under `/api/*`.
6. Central `errorHandler`: Catch-all error formatting.

#### 2. REST API Design & CRUD Endpoints
Strict alignment with REST architectural constraints:
- `GET /api/jobs`: Query collection with filtering, pagination, and sorting.
- `GET /api/jobs/:id`: Read single job resource.
- `POST /api/jobs`: Create new job resource (`201 Created`).
- `PATCH /api/jobs/:id`: Partial resource modification.
- `DELETE /api/jobs/:id`: Remove resource.
- `POST /api/applications`: Submit application resource.
- `PATCH /api/applications/:id/stage`: Transition pipeline state.

#### 3. Status Codes Enforced
- `200 OK`: Successful read or update.
- `201 Created`: Resource successfully created (User, Job, Application, Note).
- `400 Bad Request`: Validation failure or invalid state machine transition.
- `401 Unauthorized`: Token missing, expired, or malformed.
- `403 Forbidden`: Authenticated user lacks required role or resource ownership.
- `404 Not Found`: Target ID does not exist in the database.
- `409 Conflict`: Duplicate entry (duplicate email or duplicate application).
- `500 Internal Server Error`: Unhandled server exception.

#### 4. Validation & Sanitization with `express-validator`
Implemented in [`backend/src/routes/jobRoutes.js`](file:///e:/Job%20Application/backend/src/routes/jobRoutes.js) and [`backend/src/middleware/validatorMiddleware.js`](file:///e:/Job%20Application/backend/src/middleware/validatorMiddleware.js):
```javascript
const createJobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('role').trim().notEmpty().withMessage('Role/designation is required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 chars'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('workMode').optional().isIn(['Remote', 'Hybrid', 'On-site']),
  validate,
];
```

#### 5. Authentication, JWT & Password Hashing
- **Salting & Hashing**: In [`backend/src/models/User.js`](file:///e:/Job%20Application/backend/src/models/User.js):
  - Uses `bcryptjs` with 10 salt rounds to hash plain passwords prior to persistence.
  - Exposes `user.matchPassword(enteredPassword)` method.
- **Stateless JWT**: In [`backend/src/controllers/authController.js`](file:///e:/Job%20Application/backend/src/controllers/authController.js):
  - `jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })` issues cryptographically signed tokens.
- **Auth Middleware**: In [`backend/src/middleware/authMiddleware.js`](file:///e:/Job%20Application/backend/src/middleware/authMiddleware.js):
  - Extracts `Bearer <token>` from the `Authorization` header, verifies validity with `jwt.verify`, and populates `req.user`.

#### 6. Role-Based Access Control (RBAC)
- In [`backend/src/middleware/roleMiddleware.js`](file:///e:/Job%20Application/backend/src/middleware/roleMiddleware.js):
```javascript
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};
```

#### 7. Multer File Uploads
- In [`backend/src/utils/fileHandler.js`](file:///e:/Job%20Application/backend/src/utils/fileHandler.js):
  - Disk storage with unique timestamp suffixes (`resume-1718000000000.pdf`).
  - File size cap: **2 MB**.
  - MIME-type validation whitelist: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.

#### 8. Central Error Handling Middleware
- In [`backend/src/middleware/errorHandler.js`](file:///e:/Job%20Application/backend/src/middleware/errorHandler.js):
  - Intercepts MongoDB `CastError` (invalid ObjectId format) ➔ `404 Not Found`.
  - Intercepts MongoDB `code 11000` duplicate key ➔ `409 Conflict`.
  - Intercepts `ValidationError` ➔ `400 Bad Request`.
  - Intercepts `MulterError: LIMIT_FILE_SIZE` ➔ `400 Bad Request`.

#### 9. API Testing with Postman & Insomnia
- Exported complete JSON collection: [`backend/candidex-api.postman_collection.json`](file:///e:/Job%20Application/backend/candidex-api.postman_collection.json).
- Pre-configured with variables `{{baseUrl}}`, `{{candidateToken}}`, `{{recruiterToken}}`, and `{{adminToken}}`.

---

## 3. Database Architecture & Compound Indexes

### 1. Compound Search Indexes (`Job` Model)
Faceted search requires compound queries matching multiple fields simultaneously:
```javascript
// Compound index for role, location, and minimum experience
jobSchema.index({ role: 1, location: 1, minExp: 1 });

// Compound index for recency and publication status
jobSchema.index({ status: 1, createdAt: -1 });

// Compound text index for full-text search with relative weights
jobSchema.index(
  { title: 'text', description: 'text', role: 'text', skills: 'text' },
  { weights: { title: 10, role: 8, skills: 6, description: 1 } }
);
```

### 2. Duplicate Application Prevention (`Application` Model)
Rather than executing a race-condition-prone `find()` check followed by an `insert()`, the database enforces a compound unique index:
```javascript
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
```
If a candidate submits two applications simultaneously, MongoDB guarantees that only the first write succeeds, throwing error `11000` on the duplicate.

### 3. Dynamic Profile Completion Algorithm (`CandidateProfile` Model)
The profile completion percentage is dynamically calculated on pre-save hooks:
- Headline ($> 5$ chars): $+15\%$
- Bio ($> 20$ chars): $+15\%$
- Skills ($\ge 3$ skills): $+20\%$
- Education ($\ge 1$ entry): $+15\%$
- Work Experience ($\ge 1$ entry): $+15\%$
- Uploaded Resume ($\ge 1$ document): $+15\%$
- Portfolio Links: $+5\%$
- **Total Maximum Score**: $100\%$

---

## 4. Recruitment Pipeline State Machine

Candidate applications cannot change stages arbitrarily. Transitions must follow a strict finite state machine defined in [`backend/src/models/Application.js`](file:///e:/Job%20Application/backend/src/models/Application.js#L3-L9):

```
       ┌───────────┐
       │  applied  │
       └─────┬─────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌────────────┐ ┌──────────┐
│shortlisted │ │ rejected │
└─────┬──────┘ └──────────┘
      │
      ▼
┌────────────┐
│ interview  │
└─────┬──────┘
      │
      ▼
┌────────────┐
│  offered   │
└────────────┘
```

```javascript
export const STAGE_FLOW = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: ['rejected'],
  rejected: ['applied', 'shortlisted'] // Allows reconsideration
};

applicationSchema.methods.canTransitionTo = function (nextStage) {
  if (this.stage === nextStage) return true;
  const allowed = STAGE_FLOW[this.stage] || [];
  return allowed.includes(nextStage);
};
```

---

## 5. Security & IDOR Prevention Architecture

### What is IDOR?
**Insecure Direct Object Reference (IDOR)** occurs when an application provides direct access to objects based on user-supplied input (e.g. `GET /api/files/resume-123.pdf`) without validating ownership. An unauthorized candidate could guess filenames and download other candidates' private contact details and resumes.

### How Candidex Prevents IDOR:
In [`backend/src/controllers/uploadController.js`](file:///e:/Job%20Application/backend/src/controllers/uploadController.js#L50-L105):
1. **Authentication Check**: Requesters must present a valid JWT bearer token.
2. **Access Control Matrix**:
   - **Admin**: Permitted access across all documents.
   - **Candidate**: Can *only* download the file if their `CandidateProfile.resumes` array contains that filename.
   - **Recruiter**: Can *only* download the file if the candidate submitted that resume to a job **owned by that recruiter**.
3. **Chunked Stream Delivery**: If authorized, `fs.createReadStream` pipes the document directly to the client. If unauthorized, returns `403 Forbidden`.

---

## 6. Complete REST API Specification

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (`name`, `email`, `password`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/demo-login` | Public | 1-click evaluator login (`candidate`, `recruiter`, `admin`) |
| `GET` | `/api/auth/me` | Private | Returns current authenticated user profile |

### Job Routes (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | Public | Faceted search with query params (`q`, `role`, `location`, `workMode`, `minExp`, `ctcMin`, `skills`) |
| `GET` | `/api/jobs/:id` | Public | Get single job details with applicant count |
| `POST` | `/api/jobs` | Recruiter/Admin | Publish new job opening (`title`, `ctcRange`, `skills`, `description`) |
| `PATCH` | `/api/jobs/:id` | Recruiter/Admin | Update job opening (verifies recruiter ownership) |
| `PATCH` | `/api/jobs/:id/close`| Recruiter/Admin | Mark job opening as closed |
| `DELETE`| `/api/jobs/:id` | Recruiter/Admin | Delete job posting and cascade delete applications |
| `GET` | `/api/jobs/:id/applicants` | Recruiter/Admin | List all applicants for this job with candidate profiles |

### Application Routes (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/applications` | Candidate | Submit job application (`jobId`, `resumeUrl`, `coverNote`) |
| `GET` | `/api/applications/me` | Candidate | List current candidate's applications with pipeline stages |
| `PATCH` | `/api/applications/:id/stage` | Recruiter/Admin | Advance applicant stage with state machine validation |
| `POST` | `/api/applications/:id/notes` | Recruiter/Admin | Append internal recruiter evaluation note |

### Profile & Upload Routes (`/api/profile` & `/api/uploads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile/me` | Candidate | Get profile data & completion score |
| `PUT` | `/api/profile/me` | Candidate | Update profile fields, skills, and portfolio links |
| `POST` | `/api/profile/save-job/:id`| Candidate | Toggle bookmark status for a job |
| `GET` | `/api/profile/saved-jobs` | Candidate | List bookmarked jobs |
| `POST` | `/api/uploads/resume` | Candidate | Multer upload (PDF/DOCX max 2MB) |
| `GET` | `/api/files/:filename` | Private | IDOR-protected resume streaming via Node Streams |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/analytics` | Admin Only | Aggregation pipelines: funnel counts, work mode distribution |
| `GET` | `/api/admin/jobs` | Admin Only | Moderation view for all platform jobs |
| `PATCH` | `/api/admin/jobs/:id/status`| Admin Only | Approve or revoke job publication status |
| `GET` | `/api/admin/users` | Admin Only | Platform user directory with role filters |
| `PATCH` | `/api/admin/users/:id/status`| Admin Only | Toggle user account activation status |

---

## 7. Placement & Technical Interview Question Bank

### Q1: How do you enforce that a recruiter can only view applicants for jobs they own?
> **Answer**: We enforce ownership at the controller layer before executing database queries. When a recruiter requests `GET /api/jobs/:id/applicants`, the server retrieves the job document, verifies that `job.recruiterId.toString() === req.user._id.toString()` (or `req.user.role === 'admin'`). If the recruiter does not own the job, the server halts execution and returns `403 Forbidden`.

### Q2: What is IDOR, and how did you prevent it on the resume download endpoint?
> **Answer**: Insecure Direct Object Reference (IDOR) allows attackers to access private files by manipulating parameter references (like filename or ID). In Candidex, resumes are stored in private storage and accessed via `GET /api/files/:filename`. Before streaming the file with `fs.createReadStream`, the controller verifies whether the requester is the candidate who owns the document, a recruiter who owns the job where the candidate applied, or an administrator. If neither condition is met, access is denied with `403 Forbidden`.

### Q3: Why is a unique compound index better than a "find-then-insert" check for duplicate applications?
> **Answer**: A "find-then-insert" check is vulnerable to race conditions under concurrent requests. If a candidate double-clicks "Apply", two requests can execute the `find()` check simultaneously, both find zero existing records, and both perform an `insert()`. By enforcing a compound unique index on `{ jobId: 1, candidateId: 1 }` at the database layer, MongoDB guarantees atomicity and rejects the second write with duplicate key error `11000`, which our central error middleware maps to a `409 Conflict`.

### Q4: Design the compound indexes for your job search query. Which order and why?
> **Answer**: We use `{ role: 1, location: 1, minExp: 1 }`. Following the Equality, Sort, Range (ESR) indexing rule:
> 1. Equality filters (role and location) come first to reduce the candidate index keys immediately.
> 2. Range filters (`minExp: { $lte: N }`) come next.
> In addition, we maintain `{ status: 1, createdAt: -1 }` so public queries for active jobs sorted by recency can be served directly from index memory without an in-memory sort stage.

### Q5: How do you model and enforce valid application-stage transitions?
> **Answer**: We model the pipeline as a finite state machine: `applied` $\rightarrow$ `shortlisted` $\rightarrow$ `interview` $\rightarrow$ `offered` (or `rejected`). We store allowed transitions in a dictionary lookup `STAGE_FLOW` on the Mongoose model. When a recruiter issues a `PATCH /api/applications/:id/stage`, the method `application.canTransitionTo(nextStage)` is invoked. If an invalid jump is attempted (e.g. `applied` directly to `offered`), the server returns `400 Bad Request`.
