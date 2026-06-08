import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { requirePermission, requireRoles } from '../middleware/rbac.js';
const router = express.Router();

import {
    createLeaveRequest,
    getEmployeeLeaveRequests,
    getAllLeaveRequests,
    updateLeaveRequestStatus,
    deleteLeaveRequest,
    getLeaveBalance
} from '../controllers/leaveController.js';

// All leave request routes require authentication
router.use(authMiddleware);


// Create a new leave request
router.post('/', requirePermission('leave_requests', 'create'), createLeaveRequest);

// Get all leave requests
router.get('/', requireRoles('admin', 'hr_manager', 'manager'), getAllLeaveRequests);

// Get leave requests for a specific employee
router.get('/employee', getEmployeeLeaveRequests);

// Get employee leave balance
router.get('/leave-balance', getLeaveBalance);

// Approve or reject leave request
router.patch('/update-request/:id', requirePermission('leave_requests', 'approve'), updateLeaveRequestStatus);

// Delete leave request
router.delete('/delete-request/:id', deleteLeaveRequest);

export default router;