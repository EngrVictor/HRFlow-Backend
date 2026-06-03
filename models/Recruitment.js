import mongoose from 'mongoose';

const recruitmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    salaryRange: {
        min: Number,
        max: Number
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship'],
        default: 'full-time'
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'on_hold'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Recruitment', recruitmentSchema);