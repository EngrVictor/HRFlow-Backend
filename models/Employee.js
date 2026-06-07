import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
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
    PhoneNumber: {
        type: String,
        trim: true,
    },
    position: {
        type: String,
    },
    employeeCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    department: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
    },
    leaveBalance: {
        type: Number,
        default: 20, // Default leave balance
    },
    documentation: [
        {
            documentName: {
                type: String,
                required: true
            },
            documentType: {
                type: String,
                enum: [
                    "Resume",
                    "Certificates",
                    "Signed Contract",
                    "Cover Letter",
                    "Government ID",
                    "Offer Letter",
                    "Passport",
                    "Other"
                ]
            },
            fileUrl: {
                type: String,
                default: null
            },
                uploadedAt: {
                type: Date,
                default: Date.now
           }
        }
    ],
    certifications: [
        {
            certificationName: {
                type: String,
                required: true
            },
            institution: {
                type: String,
            },
            yearAwarded: {
                type: Number,
        },
            certificateFile: {
                type: String,
                default: null
            }
        }
    ],
    status: {   
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
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
        default: null
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

    }, {
        timestamps: true,
    });

// Create a text index on relevant fields for efficient searching
    employeeSchema.index({ 
        employeeCode: 'text',
        firstName: 'text',
        lastName: 'text',
        department: 'text',
        jobTitle: 'text',
        positionLevel: 'text',
    });


const employeeModel = mongoose.model('Employee', employeeSchema);
export default employeeModel
