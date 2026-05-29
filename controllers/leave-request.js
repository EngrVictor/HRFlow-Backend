import employeeModel from "../models/Employee";
import LeaveRequest from "../models/LeaveRequest";

// Create a new leave request
export const createLeaveRequest = async (req, res) => {
    try {
        const { employeeId, leaveType,  reason, startDate, endDate } = req.body;

        // Validating employee existence
        const employee = await employeeModel.findById(employeeId);
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
            employeeId,
           status: { $in: ['Pending', 'Approved'] },
            $or: [
                {
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                }
            ]
        });

        if (existingLeave) {
            return res.status(400).json({
                message: 'Employee already has approved leave within these dates'
            });
        }


        // Create new leave request
        const leaveRequest = new LeaveRequest({
            employeeId,
            leaveType,
            reason,
            startDate,
            endDate
        });

        await leaveRequest.save();
        res.status(201).json({ message: 'Leave request created successfully', leaveRequest });
    } catch (error) {
        res.status(500).json({ message: 'Error creating leave request', error: error.message });
    }
}

// Get all leave requests with employee details
export const getLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find().populate('employeeId', 'firstName lastName employeeCode');
        res.status(200).json(leaveRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
    }
}

// Aprove or reject a leave request
export const updateLeaveRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
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

        
        // REJECTION FLOW
        if (status === 'Rejected') {
            leaveRequest.status = 'Rejected';
            leaveRequest.approvedBy = req.user._id;
            leaveRequest.decisionDate = new Date();
            leaveRequest.managerComment = managerComment || '';

            await leaveRequest.save();

            return res.status(200).json({
                message: 'Leave request rejected',
                leaveRequest
            });
        }

        // APPROVAL FLOW
        const employee = await Employee.findById(leaveRequest.employeeId);

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
        if (employee.leaveBalance[leaveTypeKey] === undefined) {
            return res.status(400).json({
                message: `Leave type ${leaveRequest.leaveType} not supported in balance system`
            });
        }

        // Check balance
        if (employee.leaveBalance[leaveTypeKey] < numberOfDays) {
            return res.status(400).json({
                message: `Insufficient ${leaveRequest.leaveType} leave balance`
            });
        }

        // Deduct balance
        employee.leaveBalance[leaveTypeKey] -= numberOfDays;
        await employee.save();

        // Approve request
        leaveRequest.status = 'Approved';
        leaveRequest.approvedBy = req.user._id;
        leaveRequest.decisionDate = new Date();
        leaveRequest.managerComment = managerComment || '';

        await leaveRequest.save();

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