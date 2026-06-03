import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        requirements: [String]
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
         required: true
    },
    isActive: { 
    type: Boolean, 
    default: true
    }    
}, {timestamps: true});

export default mongoose.model('Job', jobSchema);