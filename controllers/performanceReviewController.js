import PerformanceReview from "../models/PerfomanceReview.js";
import employeeModel from "../models/Employee.js";
import AuditLog from '../models/AuditLog.js';
import { notifyUser, notifyManyUsers } from '../services/notificationService.js';

// Create a new performance review
export const createReview = async (req, res) => {
  try {
    const { employeeId, reviewPeriod, rating, comments, goals } = req.body;

    const currentEmployee = await employeeModel.findOne({ user: req.user._id });
    const targetEmployee = await employeeModel.findById(employeeId);

    // Admin or HR can review anyone
    const isAdminOrHR = req.userRoles.includes('admin') || req.userRoles.includes('hr_manager');
    const isManagerOfTarget = currentEmployee && targetEmployee && targetEmployee.manager?.equals(currentEmployee._id);

    if (!isAdminOrHR && !isManagerOfTarget) {
      return res.status(403).json({ error: 'You can only create reviews for your direct reports' });
    }

    if (!targetEmployee) return res.status(404).json({ message: "Employee not found" });

    const review = await PerformanceReview.create({
      employee: targetEmployee._id,
      reviewer: currentEmployee._id,
      reviewPeriod,
      rating,
      comments,
      goals,
    });

    await notifyUser(
      targetEmployee._id,
      'in_app',
      'REVIEW',
      'New Performance Review',
      `A new performance review has been created for you for the period ${reviewPeriod}.`,
      {
        relatedEntityType: 'PerformanceReview',
        relatedEntityId: review._id,
        metadata: { reviewPeriod }
      }
    );

    await AuditLog.create({
      user: user._id,
      action: 'CREATE_REVIEW',
      entityType: 'performance_review',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: currentEmployee._id,
      entityId: review._id,
    });

    res.status(201).json({ message: "Review created", review });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find().populate([
      { path: 'employee', select: 'firstName lastName employeeId' },
      { path: 'reviewer', select: 'firstName lastName employeeId' }
    ]);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// Get reviews for a specific employee
export const getEmployeeReviews = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const exists = await employeeModel.findById(employeeId);
    if (!exists) return res.status(404).json({ message: "Employee not found" });

    const reviews = await PerformanceReview.find({ employee: employeeId })
      .populate("reviewer", "firstName lastName employeeId");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee reviews", error: error.message });
  }
};

// Get a single review by ID
export const getReviewById = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id)
      .populate("employee", "firstName lastName employeeId")
      .populate("reviewer", "firstName lastName employeeId");

    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error fetching review", error: error.message });
  }
};

// Update a review (only if Draft)
export const updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.status !== "Draft") {
      return res.status(400).json({ message: "Only draft reviews can be updated" });
    }

    const { rating, comments, goals, reviewPeriod, status } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (comments !== undefined) review.comments = comments;
    if (goals !== undefined) review.goals = goals;
    if (reviewPeriod !== undefined) review.reviewPeriod = reviewPeriod;
    if (status !== undefined) review.status = status;

    await review.save();

    const employee = await employeeModel.findOne({ user: req.user._id });

    await notifyUser(
      review.employee,
      'in_app',
      'REVIEW',
      'Performance Review Updated',
      `Your performance review for the period ${review.reviewPeriod} has been updated.`,
      {
        relatedEntityType: 'PerformanceReview',
        relatedEntityId: review._id,
        metadata: { reviewPeriod: review.reviewPeriod }
      }
    );

    await AuditLog.create({
      user: user._id,
      action: 'UPDATE_REVIEW',
      entityType: 'performance_review',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: employee._id,
      entityId: review._id,
      oldData: review.toObject(),
      newData: req.body,
    });

    res.status(200).json({ message: "Review updated", review });
  } catch (error) {
    res.status(500).json({ message: "Error updating review", error: error.message });
  }
};

// Delete a review (only if Draft)
export const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.status !== "Draft") {
      return res.status(400).json({ message: "Only draft reviews can be deleted" });
    }

    await PerformanceReview.findByIdAndDelete(req.params.id);

    const employee = await employeeModel.findOne({ user: user._id });

    await AuditLog.create({
      user: user._id,
      action: 'DELETE_REVIEW',
      entityType: 'performance_review',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: employee._id,
      entityId: review._id,
      oldData: review.toObject(),
    });

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};
