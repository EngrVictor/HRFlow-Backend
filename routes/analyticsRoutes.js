import express from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController.js";
import { getDepartmentAnalytics } from "../controllers/departmentAnalytics.js";

const router = express.Router();

router.get("/dashboard", getDashboardAnalytics);
router.get("/departments", getDepartmentAnalytics);

export default router;
