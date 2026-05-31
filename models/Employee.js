import mongoose from "mongoose"

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    workForceType: {
        type: String,
        enum: [
            "Full-Time", 
            "Part-Time",
            "contract", 
            "Intern"],
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    PhoneNumber: {
        type: String,
        trim: true,
    },
    department: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
        required: true,
    },
    positionLevel: {
        type: String,
        enum: [
             "junior-level",
             "Mid-Level",
             "Senior-Level",
             "Lead",
             "Manager",
             "Director",
             "Executive",
             "intern"
            ],
    },
    employmentStatus: {
        type: String,
        enum: [
            "employed",
            "On Leave", 
            "Resigned", 
            "Suspended", 
            "Terminated", 
            "Retired", 
            "Probation"
        ],
        default: "employed",
        required: true,
    },
    salary: {
        type: Number,
        min: 0,
    },
    hireDate: {
        type: Date,
        default: Date.now,

    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    hrManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    intenship: {
        school: String,
        course: String,
        graduationDate: Date,
        internshipStartDate: Date,
        internshipEndDate: Date,
        stipend: Number,
        eligibleForFullTime:{ 
            type: Boolean, 
            default: false },

    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    profilePhoto: String,
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        },

    }, {
        timestamps: true,
    });
// Pre-save hook to set fullName before saving
    employeeSchema.pre('save', function() {
        this.fullName = `${this.firstName} ${this.lastName}`;
    });
// Create a text index on relevant fields for efficient searching
    employeeSchema.index({ 
        employeeId: 'text',
        firstName: 'text',
        lastName: 'text',
        email: 'text',
        department: 'text',
        jobTitle: 'text',
        positionLevel: 'text',
    });


const employeeModel = mongoose.model('employee', employeeSchema);
export default employeeModel