import mongoose from "mongoose";

const performanceReviewSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewPeriod: {
      type: String,
      required: true, // e.g. "Q1 2025", "2025-H1"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      default: "",
    },
    goals: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Acknowledged"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

const PerformanceReview = mongoose.model("PerformanceReview", performanceReviewSchema);

export default PerformanceReview;
