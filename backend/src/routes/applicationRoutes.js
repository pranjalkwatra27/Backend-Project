import express from 'express';
import { body } from 'express-validator';
import {
  applyToJob,
  getMyApplications,
  updateApplicationStage,
  addRecruiterNote,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('candidate'),
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('resumeUrl').notEmpty().withMessage('Resume selection is required'),
    validate,
  ],
  applyToJob
);

router.get('/me', protect, authorizeRoles('candidate'), getMyApplications);

router.patch(
  '/:id/stage',
  protect,
  authorizeRoles('recruiter', 'admin'),
  [body('stage').notEmpty().withMessage('Stage is required'), validate],
  updateApplicationStage
);

router.post(
  '/:id/notes',
  protect,
  authorizeRoles('recruiter', 'admin'),
  [body('note').trim().notEmpty().withMessage('Note content is required'), validate],
  addRecruiterNote
);

export default router;
