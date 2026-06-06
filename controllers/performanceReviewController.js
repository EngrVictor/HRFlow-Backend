import PerformanceReview from "../models/PerfomanceReview.js";
import employeeModel from "../models/Employee.js";

// Create a new performance review
export const createReview = async (req, res) => {
  try {
    const { employee, reviewPeriod, rating, comments, goals } = req.body;

    const exists = await employeeModel.findById(employee);
    if (!exists) return res.status(404).json({ message: "Employee not found" });

    const review = await PerformanceReview.create({
      employee,
      reviewer: req.user._id,
      reviewPeriod,
      rating,
      comments,
      goals,
    });

    res.status(201).json({ message: "Review created", review });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find()
      .populate("employee", "firstName lastName employeeId")
      .populate("reviewer", "email");
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
      .populate("reviewer", "email");
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
      .populate("reviewer", "email");

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
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};
