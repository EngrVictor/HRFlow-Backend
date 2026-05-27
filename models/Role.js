import mongoose from "mongoose"

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['admin', 'hr_manager', 'manager', 'employee']
    }
}, {timestamps: true})

const roleModel = mongoose.model('Role', roleSchema);
export default roleModel;