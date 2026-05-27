import mongoose from "mongoose"

const jobPostingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        enum: ['remote', 'full_time', 'part_time']
    },
    requirements: [String],
    status: {
        type: String,
        enum: ['open', 'closed', 'on_hold'],
        default: 'open'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    closingDate: Date,
}, { timestamps: true})

const jobPostingModel = mongoose.model('JobPosting', jobPostingSchema);
export default jobPostingModel;