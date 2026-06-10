import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  markOneAsRead,
  markOneAsUnread,
  getUserNotifications,
  getUnreadCount,
  markAllAsRead,
  markAllAsUnread,
  InterviewScheduled,
  LeaveApproved,
  LeaveRejected,
  PerformanceReviewSubmitted,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.patch("/one-read/:notificationId", markOneAsRead);

router.patch("/one-unread/:notificationId", markOneAsUnread);

router.get("/all-unreadcount/:userId", getUnreadCount);

router.get("/all-user-notifications/:userId", getUserNotifications);

router.patch("/all-read/:userId", markAllAsRead);

router.patch("/all-unread/:userId", markAllAsUnread);

router.delete("/delete-notification/:notificationId", deleteNotification);

router.post("/interview-scheduled", InterviewScheduled);

router.post("/leave-approved", LeaveApproved);

router.post("/leave-rejected", LeaveRejected);

router.post("/performance-review", PerformanceReviewSubmitted);

export default router;
