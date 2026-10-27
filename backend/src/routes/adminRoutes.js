import express from 'express';
import {
  getPlatformAnalytics,
  getAdminJobs,
  updateJobModerationStatus,
  getAdminUsers,
  toggleUserStatus,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/analytics', getPlatformAnalytics);
router.get('/jobs', getAdminJobs);
router.patch('/jobs/:id/status', updateJobModerationStatus);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);

export default router;
