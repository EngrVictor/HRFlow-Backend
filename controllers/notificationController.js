import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService.js";

// Create notification
export const createNotificationController = async (req, res) => {
  try {
    const notification = await createNotification(req.body);

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

// Get user notifications
export const getUserNotificationsController = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.params.userId);

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

// Mark one notification as read
export const markNotificationAsReadController = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.params.userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete notification
export const deleteNotificationController = async (req, res) => {
  try {
    await deleteNotification(req.params.id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
