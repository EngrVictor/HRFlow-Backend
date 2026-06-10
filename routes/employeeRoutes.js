import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/auth.js";
import { requirePermission, requireRoles } from "../middleware/rbac.js";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeLinkedWithManager,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

// All employee routes require authentication
router.use(authMiddleware);

router.post(
  "/create",
  upload.array("document", 10),
  createEmployee
);

router.post("/", requirePermission('employee_profile', 'create'), createEmployee);
router.get("/", requireRoles('admin', 'hr_manager'), getAllEmployees);
router.get("/:id", requirePermission('employee_profile', 'read'), getEmployeeById);
router.get("/manager/:managerId", requireRoles('admin', 'hr_manager'), getEmployeeLinkedWithManager);
router.patch("/update-employee/:id", requirePermission('employee_profile', 'update'), updateEmployee);
router.delete("/delete-employee/:id", requirePermission('employee_profile', 'delete'), deleteEmployee);

export default router;