import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { requestLogger } from './middleware/loggerMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { streamFile } from './controllers/uploadController.js';
import { protect } from './middleware/authMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Core Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom request logging middleware (Unit 3 & 5 syllabus)
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Kuvora ATS API',
    uptime: `${Math.round(process.uptime())}s`,
  });
});

// REST API Routes (Unit 5 syllabus)
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Access-controlled signed file streaming (IDOR-protected, uses Node Streams & Buffers)
app.get('/api/files/:filename', protect, streamFile);

// 404 Route Not Found handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found. Check documentation for available routes.`,
  });
});

// Central Error Handling Middleware (Unit 5 syllabus)
app.use(errorHandler);

// HTTP Server creation using Node http module (Unit 2 syllabus)
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] Kuvora ATS API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

// Global Process Error Handling (Unit 2 syllabus)
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception] ${err.name}: ${err.message}`);
  process.exit(1);
});
