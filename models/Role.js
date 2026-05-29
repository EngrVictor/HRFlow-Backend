import mongoose from "mongoose"

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'hr_manager', 'manager', 'employee']
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }]
}, {timestamps: true})

const roleModel = mongoose.model('Role', roleSchema);
export default roleModel;