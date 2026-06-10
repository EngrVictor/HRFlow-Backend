import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { requireRoles, requirePermission } from '../middleware/rbac.js';
import {
  listJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  submitApplication,
  listApplications,
  updateApplicationStatus
} from '../controllers/jobController.js';

const router = express.Router();

// Application management (HR/Admin only)
router.get('/list-applications', authMiddleware, requireRoles('admin', 'hr_manager', 'manager'), listApplications);
router.put('/update-application/:id', authMiddleware, requirePermission('recruitment', 'update'), updateApplicationStatus);

// Public routes (no auth)
router.get('/', listJobs);
router.get('/:id', getJobById);
router.post('/:id/applications', submitApplication);  // candidate submits

// All routes below require authentication
router.use(authMiddleware);

// Job management (HR/Admin only)
router.post('/', requireRoles('admin', 'hr_manager',), createJob);
router.put('/update-job/:id', requireRoles('admin', 'hr_manager',), updateJob);
router.delete('/delete-job/:id', requireRoles('admin', 'hr_manager',), deleteJob);

export default router;

// Role identifiers:
// - admin - 6a25c8ae163827759f1fe8fb
// - hr_manager - 6a25c8ae163827759f1fe8fc
// - manager - 6a25c8ae163827759f1fe8fd
// - employee - 6a25c8ae163827759f1fe8fe