import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import sendEmail from "./emailServices.js";

export const notifyUser = async (userId, type, category, title, message, options = {}) => {
  const notification = await Notification.create({
    user: userId || 'application',
    type,
    category,
    title,
    message,
    relatedEntityType: options.relatedEntityType,
    relatedEntityId: options.relatedEntityId,
    metadata: options.metadata || {},
    sentAt: new Date()
  });

  // Here you could trigger email sending (asynchronously) if type === 'email'
  if (type === 'email') {
    const user = await User.findById(userId).select('email');
    await sendEmail(user.email, title, `<p>${message}</p>`);
  }

  return notification;
}

export const notifyManyUsers = async (userIds, type, category, title, message, options = {}) => {
  const notifications = userIds.map(userId => ({
    user: userId,
    type,
    category,
    title,
    message,
    relatedEntityType: options.relatedEntityType,
    relatedEntityId: options.relatedEntityId,
    metadata: options.metadata,
    sentAt: new Date()
  }));
  return Notification.insertMany(notifications);
}

export const getManagerUserId = async (employeeId) => {
  const employee = await Employee.findById(employeeId).populate('manager');
  if (employee && employee.manager && employee.manager._id) {
    console.log(employee.manager);

    return employee.manager._id;
  }
  return null;
}