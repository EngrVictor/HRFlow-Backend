import express from 'express';
const router = express.Router();

import {
    createLeaveRequest,
    getEmployeeLeaveRequests,
    getAllLeaveRequests,
    updateLeaveRequestStatus,
    deleteLeaveRequest,
    getLeaveBalance
} from '../controllers/leave-request.js';


// Create a new leave request
router.post('/leave-requests', createLeaveRequest);

// Get all leave requests
router.get('/leave-requests', getAllLeaveRequests);

// Get leave requests for a specific employee
router.get('/leave-requests/employee/:employeeId', getEmployeeLeaveRequests);

// Get employee leave balance
router.get('/leave-balance/:employeeId', getLeaveBalance);

// Approve or reject leave request
router.put('/leave-requests/:id/status', updateLeaveRequestStatus);

// Delete leave request
router.delete('/leave-requests/:id', deleteLeaveRequest);

export default router;