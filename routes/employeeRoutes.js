import express from "express";
import upload from "../middleware/upload.js";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "../controllers/employeeController.js";

const router = express.Router();

router.post(
  "/create",
   upload.array("document", 10),
    createEmployee
  );

router.post("/create-employee", createEmployee);
router.get("/employees", getAllEmployees);
router.get("/employee/:id", getEmployeeById);
router.patch("/update-employee/:id", updateEmployee);
router.delete("/delete-employee/:id", deleteEmployee);

export default router;