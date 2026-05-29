import express from "express";

import {
  createNotificationController,
  getUserNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
} from "../controllers/notificationController.js";

const router = express.Router();

// Create notification
router.post("/", createNotificationController);

// Get all notifications for a user
router.get("/:userId", getUserNotificationsController);

// Mark single notification as read
router.patch("/:id/read", markNotificationAsReadController);

// Mark all notifications as read
router.patch("/user/:userId/read-all", markAllNotificationsAsReadController);

// Delete notification
router.delete("/:id", deleteNotificationController);

export default router;
