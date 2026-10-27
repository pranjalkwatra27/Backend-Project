# TalentPulse — Job Portal & Applicant Tracking System (ATS)

An enterprise-grade, two-sided Applicant Tracking System (ATS) and Job Portal connecting software candidates with high-growth engineering teams. Built with **React 18, Vite, Tailwind CSS, Node.js, Express.js, MongoDB Atlas (Mongoose), Multer, and JWT with role-based access control**.

---

## 🚀 Live Demo & Seed Accounts

The platform includes a built-in **1-Click Instant Persona Switcher** on the top navigation bar. You can instantly test all three roles:

| Persona | Name | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Candidate** | David Chen | `david.candidate@gmail.demo` | `Password123!` | Faceted job search, resume upload, 1-click apply, application pipeline tracker, profile builder (100% completion meter), saved jobs |
| **Recruiter** | Sarah Jenkins | `sarah.recruiter@stripe.demo` | `Password123!` | Openings management, job creation/editing, candidate dossier review, IDOR-protected resume preview, stage transitions, recruiter notes |
| **Platform Admin** | Alex Vance | `alex.admin@talentpulse.demo` | `Password123!` | Aggregation analytics (funnel stages, work mode breakdown), multi-tenant job moderation, user directory & status control |

---

## 📚 Syllabus Alignment (Units 1–5)

This application strictly implements all topics specified across the Web Development Syllabus:

### Unit 1: Web Fundamentals & JavaScript
- **HTML5 & Semantic Structure**: Descriptive semantic tags (`<header>`, `<nav>`, `<main>`, `<aside>`, `<table>`, `<section>`).
- **CSS3 & Tailwind Design System**: Curated corporate color palette (`#f8fafc` warm slate, `#4f46e5` brand indigo), clean typography (Google Fonts *Inter*), subtle border lines, accessible focus rings.
- **JavaScript & ES6**: ES Modules (`import`/`export`), arrow functions, destructuring, spread/rest operators.
- **Async JavaScript & Promises**: Asynchronous data fetching, `async/await`, custom centralized `fetch` API client.
- **NPM & Node.js Basics**: Multi-package architecture (`package.json`, dependencies, scripts).

### Unit 2: Node.js Fundamentals & Core Modules
- **HTTP Module**: Native `http.createServer(app)` hosting the Express application.
- **File System (`fs`) & Path**: Secure file system directory resolution and disk storage.
- **Streams & Buffers**: Private resume streaming (`fs.createReadStream`) piped directly into HTTP response buffers for access-controlled downloads.
- **Events & `EventEmitter`**: Custom `ApplicationEventEmitter` emitting `application:submitted`, `application:stageChanged`, and `job:statusUpdated` for audit logging and notifications.
- **Error Handling**: Process-level unhandled rejection / uncaught exception listeners and central Express error middleware.

### Unit 3 & 4: Frontend Development & UI/UX Polish
- **React 18 & Vite**: Client-side routing with `react-router-dom` v6, reactive state, context providers (`AuthContext`).
- **Polished UI/UX (Non-AI Human Product Design)**:
  - Visual hierarchy, restrained shadows (`shadow-sm`), clear spacing.
  - Interactive stage progress stepper (`Applied` ➔ `Shortlisted` ➔ `In Interview` ➔ `Offered`).
  - Circular SVG Profile Completion scoring meter (0–100%).
  - Skeleton loading states and informative empty states.

### Unit 5: Express.js & REST APIs
- **RESTful API Architecture**: Strict HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`).
- **Validation & Sanitization**: `express-validator` schema chains sanitizing and validating request payloads.
- **Authentication & Security**:
  - Passwords hashed using `bcryptjs` (salt rounds: 10).
  - Stateless JSON Web Tokens (`jwt.sign`, `jwt.verify`) with expiration (`7d`).
  - Role-based authorization middleware (`protect`, `authorizeRoles('candidate', 'recruiter', 'admin')`).
- **File Uploads**: `multer` disk storage enforcing 2MB size cap and strict MIME-type whitelist (`application/pdf`, `.doc`, `.docx`).
- **IDOR Prevention (Insecure Direct Object Reference)**:
  - Secure signed file streaming endpoint `GET /api/files/:filename`.
  - Verifies candidate ownership or recruiter job ownership before streaming private documents.
- **MongoDB & Mongoose Compound Indexing**:
  - Faceted search compound index on `{ role: 1, location: 1, minExp: 1 }`.
  - Unique compound index on `{ jobId: 1, candidateId: 1 }` preventing duplicate applications at the database layer.
  - State machine transition validation helper on application models.
  - MongoDB Aggregation pipelines (`$group`, `$sum`) for recruitment funnel reporting.

---

## 🛠️ Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose connection & event handlers
│   │   ├── controllers/
│   │   │   ├── adminController.js    # Aggregations, job moderation, user management
│   │   │   ├── applicationController.js # State machine stage updates, duplicate checks
│   │   │   ├── authController.js     # Register, JWT login, getMe, demo-login
│   │   │   ├── jobController.js      # Faceted search, recruiter applicant viewer
│   │   │   ├── profileController.js  # Profile builder, score calculation, bookmarks
│   │   │   └── uploadController.js   # Multer handler & IDOR-safe streamFile
│   │   ├── events/
│   │   │   └── appEvents.js          # Node.js EventEmitter audit & notifications
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT token validation
│   │   │   ├── errorHandler.js       # Central error middleware (CastError, 11000 duplicate)
│   │   │   ├── loggerMiddleware.js   # HTTP timing & colored logging
│   │   │   ├── roleMiddleware.js     # Role access guard (candidate/recruiter/admin)
│   │   │   └── validatorMiddleware.js# express-validator result handler
│   │   ├── models/
│   │   │   ├── Application.js        # Compound unique index & state machine
│   │   │   ├── CandidateProfile.js   # Indexed skills & completion score calculation
│   │   │   ├── Job.js                # Compound search indexes & salary range
│   │   │   └── User.js               # Password hashing & role definitions
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── applicationRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── jobRoutes.js
│   │   │   ├── profileRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── scripts/
│   │   │   └── seed.js               # Realistic data seeder for demo evaluation
│   │   ├── utils/
│   │   │   └── fileHandler.js        # Multer storage configuration
│   │   └── server.js                 # HTTP server entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # Central fetch client with JWT injection
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Badge.jsx         # Status, Stage, and WorkMode badges
│   │   │       ├── Modal.jsx         # Accessible modal dialog
│   │   │       ├── Navbar.jsx        # Multi-role navigation & demo switcher
│   │   │       └── SkeletonLoader.jsx# Shimmer skeleton loading components
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # User state, JWT storage, role handlers
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx # Funnel analytics, job moderation, user list
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx     # Login with 1-click evaluation buttons
│   │   │   │   └── RegisterPage.jsx  # Role-specific registration
│   │   │   ├── candidate/
│   │   │   │   ├── JobSearchPage.jsx # Faceted search, quick apply, detail modal
│   │   │   │   ├── MyApplicationsPage.jsx # Visual pipeline stepper tracker
│   │   │   │   ├── ProfilePage.jsx   # Profile builder, skills chips, resume upload
│   │   │   │   └── SavedJobsPage.jsx # Bookmarked openings
│   │   │   └── recruiter/
│   │   │       ├── ApplicantPipelinePage.jsx # Candidate dossier & stage switcher
│   │   │       ├── JobEditorModal.jsx # Create / edit opening form
│   │   │       ├── JobManagementPage.jsx # Postings list & status toggles
│   │   │       └── RecruiterDashboard.jsx # Metrics & recent applicant activity
│   │   ├── App.jsx                   # Role-guarded routes
│   │   ├── index.css                 # Design system tokens & typography
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🏃 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB community server (port `27017`) or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populates realistic demo jobs, candidates, and applications
npm run dev      # Starts API server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Key Interview Discussion Points

1. **How do you prevent duplicate job applications?**
   - Rather than relying on a vulnerable "find-then-insert" race condition, we enforce a compound unique index on `{ jobId: 1, candidateId: 1 }` at the MongoDB database layer. Any concurrent duplicate submission immediately throws a clean code `11000` duplicate key error, which the central error middleware translates into an intelligible `409 Conflict` response.
2. **What is IDOR and how is it prevented on resume downloads?**
   - Insecure Direct Object Reference occurs when users guess file IDs or names to download arbitrary private files. We place resume downloads behind `GET /api/files/:filename`, protected by JWT authentication. Before streaming the document, the server verifies whether the requester is the candidate who owns the document, a recruiter who owns the job the candidate applied to, or a platform administrator.
3. **How are recruitment stage transitions enforced?**
   - Instead of allowing arbitrary status updates, the server models a finite state machine: `applied` ➔ `shortlisted` ➔ `interview` ➔ `offered` (or `rejected`). Invalid transitions (such as jumping straight from `applied` to `offered`) are rejected with `400 Bad Request`.
