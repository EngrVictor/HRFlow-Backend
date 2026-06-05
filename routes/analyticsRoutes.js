import express from "express";
import {
  getDashboardAnalytics,
  getLeaveSummary,
  getRecruitmentMetrics,
  getPerformanceDistribution,
  getHeadcount,
  getAuditLogs,
} from "../controllers/analyticsController.js";
import { getDepartmentAnalytics } from "../controllers/departmentAnalytics.js";

const router = express.Router();

router.get("/dashboard", getDashboardAnalytics);
router.get("/departments", getDepartmentAnalytics);
router.get("/leave-summary", getLeaveSummary);
router.get("/recruitment-metrics", getRecruitmentMetrics);
router.get("/performance-distribution", getPerformanceDistribution);
router.get("/headcount", getHeadcount);
router.get("/audit-logs", getAuditLogs);

export default router;
