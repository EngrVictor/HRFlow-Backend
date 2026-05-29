import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "General",
    },
    position: String,
    salary: Number,
    // addedstatus field to track employee status
    status: {   
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    leaveBalanceDays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const employeeModel = mongoose.model("Employee", employeeSchema);

export default employeeModel;