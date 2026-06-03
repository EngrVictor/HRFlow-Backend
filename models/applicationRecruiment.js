import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicationName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowerCase: true
    },
    resumeUrl: {
        type: String,
        required: true
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        enum:['pending', 'reviewed', 'hired', 'rejected'],
        default: 'pending'}
    }, { timestamps: true });

    export default mongoose.model('Application', applicationSchema);