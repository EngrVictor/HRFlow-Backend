import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/create-employee", createEmployee);
router.get("/employees", getAllEmployees);
router.get("/employee/:id", getEmployeeById);
router.patch("/update-employee/:id", updateEmployee);
router.delete("/delete-employee/:id", deleteEmployee);

export default router;