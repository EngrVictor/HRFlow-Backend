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
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    googleId: { 
        type: String, 
        sparse: true, 
        index: true 
    },
    appleId: { 
        type: String, 
        sparse: true, 
        index: true 
    },
    authProviders: {
        email: { type: Boolean, default: false },
        google: { type: Boolean, default: false },
        apple: { type: Boolean, default: false }
    },
    profile: {
        firstName: String,
        lastName: String,
        avatar: String
    },
    roles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role'
    }],
    mustChangePassword: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const userModel = mongoose.model('User', userSchema);
export default userModel;  