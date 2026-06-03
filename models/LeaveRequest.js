import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee', 
        required: true
    },

    leaveType: {
        type: String,
        enum: ['Annual', 'Sick', 'Casual', 'Maternity'],
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },

    managerComment: {
        type: String
    },

    decisionDate: {
        type: Date
    }
}, { timestamps: true });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;