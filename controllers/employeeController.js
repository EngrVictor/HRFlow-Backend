import employeeModel from "../models/Employee.js";
import cloudinary from "../config/cloudinary.js";

//CREATE EMPLOYEE

export const createEmployee = async (req, res) => {
  try {
    let documentation = [];
    if (req.files && req.files.length > 0) {
      const result = await cloudinary.uploader.upload(req.files[0].path,
        {
          folder: "employee-documents", 
        }
      ); 
      documentation.push({
      document_name: req.files[0].originalname,
      file_url: result.secure_url,
      document_type: req.body.document_type || "Other"
      });
    }
    const employee = await employeeModel.create({ ...req.body,
       documentation
    });
     return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET ALL EMPLOYEES

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.find();

    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET EMPLOYEE BY ID

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeModel.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//UPDATE EMPLOYEE

export const updateEmployee = async (req, res) => {
  try {
    const employee = await employeeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE EMPLOYEE

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await employeeModel.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};