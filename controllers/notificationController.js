import Notification from "../models/Notification.js";
import sendEmail from "../services/emailServices.js";

// CREATE notification
export const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields. Please provide userId, title, message, and type.",
      });
    }

    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark ONE notification as READ
export const markOneAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found in the database",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark ONE notification as UNREAD
export const markOneAsUnread = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: false },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification document not found" });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as unread successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get ALL notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark ALL notifications as READ
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const notification = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Mark ALL notifications as UNREAD
export const markAllAsUnread = async (req, res) => {
  try {
    const { userId } = req.params;
    const notification = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: false },
    );

    res.status(200).json({
      success: true,
      message: `All notifications for user ${userId} have been successfully marked as unread`,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const deletedNotification =
      await Notification.findByIdAndDelete(notificationId);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found. It may have already been deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: deletedNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// MVP WORKFLOW APIs

const notificationProcess = async (
  userId,
  recipientEmail,
  title,
  message,
  type,
) => {
  // 1. Log the notification in the database
  const savedNotification = await Notification.create({
    userId,
    title,
    message,
    type,
  });

  // 2. Dispatch real-time external email if the email is supplied
  if (recipientEmail) {
    await sendEmail(recipientEmail, title, message);
  }
  return savedNotification;
};

// RECRUITMENT WORKFLOW: Interview Scheduled
export const InterviewScheduled = async (req, res) => {
  try {
    const {
      userId,
      recipientEmail,
      candidateName,
      interviewDate,
      interviewTime,
    } = req.body;
    const title = "Interview Scheduled Successfully";
    const message =
      "Hello " +
      candidateName +
      ", your interview for the requested position on HRFlow Africa has been scheduled for " +
      interviewDate +
      " at " +
      interviewTime +
      ". Please check your calendar link. ";
    const Value = await notificationProcess(
      userId,
      recipientEmail,
      title,
      message,
      "INTERVIEW",
    );

    res.status(201).json({
      success: true,
      message: "Interview notification logged and email sent successfully",
      data: Value,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// LEAVE MANAGEMENT WORKFLOW: Leave Approved
export const LeaveApproved = async (req, res) => {
  try {
    const { userId, recipientEmail, employeeName, startDate, endDate } =
      req.body;

    const title = "Leave Request Approved";
    const message =
      "Congratulations " +
      employeeName +
      ", your leave request tracking from " +
      startDate +
      " to " +
      endDate +
      " has been formally approved by management. Enjoy your time off!";

    const Value = await notificationProcess(
      userId,
      recipientEmail,
      title,
      message,
      "LEAVE",
    );
    res.status(201).json({
      success: true,
      message: "Leave has been approved: notification dispatched successfully",
      data: Value,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// LEAVE MANAGEMENT WORKFLOW: Leave Rejected
export const LeaveRejected = async (req, res) => {
  try {
    const { userId, recipientEmail, employeeName, startDate, denialReason } =
      req.body;

    const title = " Leave Request Declined";
    const message =
      "Hello " +
      employeeName +
      ", we regret to inform you that your leave request starting on " +
      startDate +
      " has been declined. Reason given: " +
      (denialReason || "Business requirements") +
      ".";

    const Value = await notificationProcess(
      userId,
      recipientEmail,
      title,
      message,
      "LEAVE",
    );

    res.status(201).json({
      success: true,
      message: "Leave has been rejected: notification dispatched successfully",
      data: Value,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PERFORMANCE MANAGEMENT WORKFLOW: Review Submitted
export const PerformanceReviewSubmitted = async (req, res) => {
  try {
    const { userId, recipientEmail, employeeName, reviewQuarter } = req.body;

    const title = "Performance Review Available";
    const message =
      "Hello " +
      employeeName +
      ", your supervisor has successfully finalized and submitted your workplace evaluation review for " +
      reviewQuarter +
      ". Please access your dashboard portal to review metrics feedback.";

    const Value = await notificationProcess(
      userId,
      recipientEmail,
      title,
      message,
      "PERFORMANCE",
    );

    res.status(201).json({
      success: true,
      message:
        "Performance review notification logged and email sent successfully",
      data: Value,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
