import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Connects or references this ID back to the 'User' collection
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // Category tags to help the frontend sort or add different icons (e.g., a calendar icon for interviews)
    type: {
      type: String,
      enum: [
        "LEAVE",
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
  },
  {
    timestamps: true, // automatically create 'createdAt' and 'updatedAt' date fields for every single entry
  },
);

// Create the operational Model out of the blueprint schema
const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; // Export the model
