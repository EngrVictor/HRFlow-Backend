import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "hr-manager", "manager", "employee"],
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    roles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role'
    }]
}, {timestamps: true})

const userModel = mongoose.model('User', userSchema);
export default userModel;  