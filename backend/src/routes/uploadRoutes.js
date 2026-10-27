import express from 'express';
import { uploadResume, streamFile } from '../controllers/uploadController.js';
import { upload } from '../utils/fileHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Upload resume endpoint (Candidate only)
router.post('/resume', protect, authorizeRoles('candidate'), upload.single('resume'), uploadResume);

export default router;
