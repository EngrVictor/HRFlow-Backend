import mongoose from "mongoose"

const performanceReviewSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    // e.g. "Q1-2025", "Annual-2025"
    reviewCycle: {
        type: String,
        required: true
    },
    reviewType: {
        type: String,
        enum: ['self', 'manager', 'peer'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comments: {
        type: String
    },
    goals: [String],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'acknowledged'],
        default: 'draft'
    }
}, { timestamps: true })

const PerformanceReview = mongoose.model('PerformanceReview', performanceReviewSchema);
export default PerformanceReview;
