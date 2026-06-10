import employeeModel from "../models/Employee.js";
import userModel from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";
import AuditLog from '../models/AuditLog.js';
import { notifyUser, notifyManyUsers } from '../services/notificationService.js';


const generateEmployeeCode = async () => {
  const lastEmployee = await employeeModel.findOne().sort({ employeeCode: -1 }).lean();
  let nextNumber = 1;
  if (lastEmployee && lastEmployee.employeeCode) {
    const match = lastEmployee.employeeCode.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0]) + 1;
  }
  return `EMP${nextNumber.toString().padStart(3, '0')}`;
}

const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('base64url');
};

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

    const { email, role, firstName, lastName, department, position, managerId, hireDate, salary, leaveBalanceDays } = req.body;
    const userId = req.user._id;

    const employeeCode = await generateEmployeeCode();
    const tempPassword = generateRandomPassword();


    const user = await userModel.create({ email, password: tempPassword, roles: [role], mustChangePassword: true });

    const employee = await employeeModel.create({
      user: user._id,
      firstName,
      lastName,
      department,
      position,
      manager: managerId || null,
      hireDate: hireDate || new Date(),
      salary: salary || null,
      leaveBalanceDays: leaveBalanceDays || 20,
      documentation,
      employeeCode: employeeCode,
    });

    const creatorEmployee = await employeeModel.findOne({ user: userId });

    await notifyUser(
      employee.manager,
      'email',
      'RECRUITMENT',
      'New employee created',
      `${employee.firstName} ${employee.lastName} has been added to the system.`,
      {
        relatedEntityType: 'Employee',
        relatedEntityId: employee._id,
        metadata: { employeeName: `${employee.firstName} ${employee.lastName}` }
      }
    );

    await AuditLog.create({
      user: userId,
      action: 'CREATE_EMPLOYEE',
      entityType: 'Employee',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: creatorEmployee._id,
      entityId: employee._id,
      newData: { email, firstName, lastName, department, position }
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

//GET EMPLOYEE LINKED WITH MANAGER

export const getEmployeeLinkedWithManager = async (req, res) => {
  try {
    const managerId = req.params.managerId;
    const employees = await employeeModel.find({ manager: managerId });

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

    await notifyUser(
      employee.manager,
      'in_app',
      'RECRUITMENT',
      'Employee updated',
      `${employee.firstName} ${employee.lastName} has been updated.`,
      {
        relatedEntityType: 'Employee',
        relatedEntityId: employee._id,
        metadata: { employeeName: `${employee.firstName} ${employee.lastName}` }
      }
    );

    const creatorEmployee = await employeeModel.findOne({ user: req.user._id });

    await AuditLog.create({
      user: req.user._id,
      action: 'UPDATE_EMPLOYEE',
      entityType: 'Employee',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: creatorEmployee._id,
      entityId: employee._id,
      oldData: employee.toObject(),
      newData: req.body
    });

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

    const creatorEmployee = await employeeModel.findOne({ user: req.user._id });

    await AuditLog.create({
      user: req.user._id,
      action: 'DELETE_EMPLOYEE',
      entityType: 'Employee',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: creatorEmployee._id,
      entityId: employee._id,
    });

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