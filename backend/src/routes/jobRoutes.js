import express from 'express';
import { body } from 'express-validator';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  closeJob,
  deleteJob,
  getJobApplicants,
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validatorMiddleware.js';

const router = express.Router();

// Validation chains for job creation
const createJobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('role').trim().notEmpty().withMessage('Role/designation is required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Job description must be at least 20 characters'),
  body('location').trim().notEmpty().withMessage('Job location is required'),
  body('skills').notEmpty().withMessage('At least one skill is required'),
  body('workMode').optional().isIn(['Remote', 'Hybrid', 'On-site']).withMessage('Invalid work mode'),
  validate,
];

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Recruiter / Admin protected routes
router.post('/', protect, authorizeRoles('recruiter', 'admin'), createJobValidation, createJob);
router.patch('/:id', protect, authorizeRoles('recruiter', 'admin'), updateJob);
router.patch('/:id/close', protect, authorizeRoles('recruiter', 'admin'), closeJob);
router.delete('/:id', protect, authorizeRoles('recruiter', 'admin'), deleteJob);
router.get('/:id/applicants', protect, authorizeRoles('recruiter', 'admin'), getJobApplicants);

export default router;
