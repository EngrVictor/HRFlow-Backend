import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  resumeUrl: String,
  status: {
    type: String,
    enum: ['submitted', 'shortlisted', 'interviewed', 'rejected', 'hired'],
    default: 'submitted'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  reviewNote: String
}, { timestamps: true });

applicationSchema.index({ jobPosting: 1, candidateEmail: 1 });

export default mongoose.model('Application', applicationSchema);