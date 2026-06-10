import express from "express";
import { createRequire } from "module";
import { authMiddleware } from "../middleware/auth.js";
import {
  createReview,
  getAllReviews,
  getEmployeeReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/performanceReviewController.js";

const require = createRequire(import.meta.url);
const { requireRoles } = require("../middleware/rbac.js");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", requireRoles("admin", "hr", "manager"), createReview);
router.get("/", requireRoles("admin", "hr", "manager"), getAllReviews);
router.get("/employee/:employeeId", requireRoles("admin", "hr", "manager"), getEmployeeReviews);
router.get("/:id", requireRoles("admin", "hr", "manager"), getReviewById);
router.put("/:id", requireRoles("admin", "hr", "manager"), updateReview);
router.delete("/:id", requireRoles("admin", "hr"), deleteReview);

export default router;
