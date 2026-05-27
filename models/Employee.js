import mongoose from "mongoose"

const employeeSchema = new mongoose.Schema({
    user: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeCode: {
        type: String,
        required: true,
        unique: true
    },
    fisrtName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    department: String,
    position: String,
    salary: Number,
    leaveBalanceDays: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const employeeModel = mongoose.model('employee', employeeSchema);
export default employeeModel