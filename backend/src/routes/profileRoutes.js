import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  toggleSaveJob,
  getSavedJobs,
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('candidate'));

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);
router.post('/save-job/:jobId', toggleSaveJob);
router.get('/saved-jobs', getSavedJobs);

export default router;
