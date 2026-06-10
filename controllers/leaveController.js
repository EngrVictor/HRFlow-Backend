import employeeModel from "../models/Employee.js";
import LeaveRequest from "../models/LeaveRequest.js";
import AuditLog from '../models/AuditLog.js';
import { notifyUser, notifyManyUsers } from '../services/notificationService.js';

// Create a new leave request
export const createLeaveRequest = async (req, res) => {
    try {
        const { leaveType, reason, startDate, endDate } = req.body;

        // Validating employee existence
        const employee = await employeeModel.findOne({ user: req.user._id });
        console.log(employee);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Validate dates
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                message: 'End date cannot be before start date'
            });
        }

        // Prevent double booking
        const existingLeave = await LeaveRequest.findOne({
            employeeId: employee._id,
            status: { $in: ['Pending', 'Approved'] },
            startDate: { $lte: endDate },
            endDate: { $gte: startDate }
        });

        if (existingLeave) {
            return res.status(400).json({
                message: 'Employee already has an active leave request within these dates'
            });
        }


        // Create new leave request
        const leaveRequest = new LeaveRequest({
            employeeId: employee._id,
            leaveType,
            reason,
            startDate,
            endDate
        });

        await leaveRequest.save();

        // Notify manager
        if (employee.manager) {
            await notifyUser(
                employee.manager,
                'in_app',
                'LEAVE_REQUEST',
                'New Leave Request',
                `${employee.firstName} ${employee.lastName} requested ${leaveType} leave from ${startDate} to ${endDate}.`,
                {
                    relatedEntityType: 'LeaveRequest',
                    relatedEntityId: leaveRequest._id,
                    metadata: { employeeName: `${employee.firstName} ${employee.lastName}` }
                }
            );
        }

        await AuditLog.create({
            user: user._id,
            action: 'CREATE_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            performedBy: employee._id,
            entityId: leaveRequest._id,
            newData: { leaveType, reason, startDate, endDate }
        });
        res.status(201).json({ message: 'Leave request created successfully', leaveRequest });
    } catch (error) {
        res.status(500).json({ message: 'Error creating leave request', error: error.message });
    }
}

// Get leave balance 
export const getLeaveBalance = async (req, res) => {
    try {
        const employee = await employeeModel.findOne({ user: req.user._id });

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        return res.status(200).json({
            leaveBalance: employee.leaveBalance
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching leave balance',
            error: error.message
        });
    }
};

// Get all leave requests with employee details
export const getAllLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find()
        res.status(200).json(leaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
    }
}

// Get leave requests for a specific employee
export const getEmployeeLeaveRequests = async (req, res) => {
    try {

        // Validate employee existence
        const employee = await employeeModel.findOne({ user: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const leaveRequests = await LeaveRequest.find({ employeeId: employee._id }).populate('employeeId', 'firstName lastName employeeCode');
        res.status(200).json(leaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
    }
};

// Aprove or reject a leave request
export const updateLeaveRequestStatus = async (req, res) => {
    try {
        const { id, } = req.params;
        const { status, managerComment } = req.body;

        // Only final decisions allowed
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be either Approved or Rejected'
            });
        }

        const leaveRequest = await LeaveRequest.findById(id);

        if (!leaveRequest) {
            return res.status(404).json({
                message: 'Leave request not found'
            });
        }

        // Prevent re-processing
        if (leaveRequest.status !== 'Pending') {
            return res.status(400).json({
                message: `Leave request already ${leaveRequest.status.toLowerCase()}`
            });
        }

        const reviewer = await employeeModel.findOne({ user: req.user._id });

        // REJECTION FLOW
        if (status === 'Rejected') {
            leaveRequest.status = 'Rejected';
            leaveRequest.approvedBy = reviewer._id;
            leaveRequest.decisionDate = new Date();
            leaveRequest.managerComment = managerComment || '';

            await leaveRequest.save();

            // Notify employee
            const employeeUser = leaveRequest.employeeId;
            await notifyUser(
                employeeUser,
                'in_app',
                'LEAVE_REQUEST',
                'Leave Request Rejected',
                `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been rejected.`,
                { relatedEntityType: 'LeaveRequest', relatedEntityId: leaveRequest._id, metadata: { managerComment } }
            );


            await AuditLog.create({
                user: user._id,
                action: 'UPDATE_LEAVE_REQUEST',
                entityType: 'LeaveRequest',
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip,
                performedBy: reviewer._id,
                entityId: leaveRequest._id,
                oldData: { status: 'Pending' },
                newData: { status, managerComment }
            });

            return res.status(200).json({
                message: 'Leave request rejected',
                leaveRequest
            });
        }

        // APPROVAL FLOW
        const employee = await employeeModel.findById(leaveRequest.employeeId);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        // Calculate number of days
        const start = new Date(leaveRequest.startDate);
        const end = new Date(leaveRequest.endDate);

        const numberOfDays =
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Map leave type to balance field
        const leaveTypeKey = leaveRequest.leaveType.toLowerCase();

        // Check if balance exists for that type
        // if (employee.leaveBalance[leaveTypeKey] === undefined) {
        //     return res.status(400).json({
        //         message: `Leave type ${leaveRequest.leaveType} not supported in balance system`
        //     });
        // }

        // Check balance
        if (employee.leaveBalance < numberOfDays) {
            return res.status(400).json({
                message: `Insufficient ${leaveRequest.leaveType} leave balance`
            });
        }

        // Deduct balance
        employee.leaveBalance -= numberOfDays;
        await employee.save();

        // Approve request
        leaveRequest.status = 'Approved';
        leaveRequest.approvedBy = reviewer._id;
        leaveRequest.decisionDate = new Date();
        leaveRequest.managerComment = managerComment || '';

        await leaveRequest.save();

        // Notify employee
        const employeeUser = leaveRequest.employeeId;
        await notifyUser(
            employeeUser,
            'in_app',
            'LEAVE_REQUEST',
            'Leave Request Approved',
            `Your ${leaveRequest.leaveType} leave request from ${leaveRequest.startDate} to ${leaveRequest.endDate} has been approved.`,
            { relatedEntityType: 'LeaveRequest', relatedEntityId: leaveRequest._id, metadata: { managerComment } }
        );

        await AuditLog.create({
            user: user._id,
            action: 'UPDATE_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            performedBy: reviewer._id,
            entityId: leaveRequest._id,
            oldData: { status: 'Pending' },
            newData: { status, managerComment }
        });

        return res.status(200).json({
            message: 'Leave request approved successfully',
            leaveRequest
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error processing leave request',
            error: error.message
        });
    }
};

// Delete a leave request (only if pending)
export const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const leaveRequest = await LeaveRequest.findById(id);

        if (!leaveRequest) {
            return res.status(404).json({
                message: 'Leave request not found'
            });
        }

        if (leaveRequest.status !== 'Pending') {
            return res.status(400).json({
                message: 'Only pending leave requests can be deleted'
            });
        }

        const deleted = await LeaveRequest.findByIdAndDelete(id);

        const employee = await Employee.findOne({ user: user._id });

        await AuditLog.create({
            user: user._id,
            action: 'DELETE_LEAVE_REQUEST',
            entityType: 'LeaveRequest',
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            performedBy: employee._id,
            entityId: id,
            oldData: deleted.toObject()
        });

        return res.status(200).json({
            message: 'Leave request deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting leave request',
            error: error.message
        });
    }
};

