import PerformanceReview from "../models/PerformanceReview.js"

// POST /api/performance-reviews
// Create a new review (self, manager, or peer)
export const createReview = async (req, res) => {
    try {
        const review = await PerformanceReview.create(req.body);
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/performance-reviews
// Get all reviews (optionally filter by employee or reviewCycle via query params)
export const getReviews = async (req, res) => {
    try {
        const filter = {};
        if (req.query.employee) filter.employee = req.query.employee;
        if (req.query.reviewCycle) filter.reviewCycle = req.query.reviewCycle;

        const reviews = await PerformanceReview.find(filter)
            .populate('employee', 'firstName lastName')
            .populate('reviewer', 'firstName lastName');

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/performance-reviews/:id
// Get a single review by ID
export const getReviewById = async (req, res) => {
    try {
        const review = await PerformanceReview.findById(req.params.id)
            .populate('employee', 'firstName lastName')
            .populate('reviewer', 'firstName lastName');

        if (!review) return res.status(404).json({ message: 'Review not found' });

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/performance-reviews/:id
// Update a review (e.g. change status to submitted or acknowledged)
export const updateReview = async (req, res) => {
    try {
        const review = await PerformanceReview.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!review) return res.status(404).json({ message: 'Review not found' });

        res.json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE /api/performance-reviews/:id
// Delete a review (e.g. discard a draft)
export const deleteReview = async (req, res) => {
    try {
        const review = await PerformanceReview.findByIdAndDelete(req.params.id);

        if (!review) return res.status(404).json({ message: 'Review not found' });

        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
