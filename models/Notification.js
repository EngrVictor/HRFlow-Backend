import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Connects or references this ID back to the 'User' collection
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['email', 'in_app', 'push'],
      default: 'in_app'
    },

    message: {
      type: String,
      required: true,
    },

    // Category tags to help the frontend sort or add different icons (e.g., a calendar icon for interviews)
    category: {
      type: String,
      enum: [
        "LEAVE_REQUEST",
        "REVIEW",
        "RECRUITMENT",
        "INTERVIEW",
        "PERFORMANCE",
        "SYSTEM",
      ],
      default: "system",
      required: true, // Notification type must be specified
    },

    isRead: {
      type: Boolean,
      default: false, // Every new notification starts out as unread
    },
    relatedEntityType: {
    type: String,
    enum: ['LeaveRequest', 'PerformanceReview', 'Application', 'User', 'Employee']
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityType'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // extra data like leave dates, etc.
    default: {}
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
  },
  {
    timestamps: true, // automatically create 'createdAt' and 'updatedAt' date fields for every single entry
  },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Create the operational Model out of the blueprint schema
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; // Export the model
