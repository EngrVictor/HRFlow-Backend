import mongoose from 'mongoose'
import userModel from '../models/User.js'
import roleModel from '../models/Role.js'
import Permission from '../models/Permission.js'
import bcrypt from 'bcrypt'
import AuditLog from '../models/AuditLog.js';
import employeeModel from "../models/Employee.js";
import { notifyUser, notifyManyUsers } from '../services/notificationService.js';


export const createUser = async (req, res) => {
  try {
    const { email, password, roles } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" })
    }

    // const userRole = await Role.findOne({ name: role });
    //   if (!userRole) {
    //     return res.status(400).send({message: "Invalid role specified"})
    // }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({ email, password: hashedPassword, roles, authProviders: { email: true, google: false, apple: false } });

    const employee = await employeeModel.findOne({ user: user._id });

    await AuditLog.create({
      user: user._id,
      action: 'CREATE_USER',
      entityType: 'User',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: employee._id || null,
      entityId: user._id,
      newData: { email }
    });

    return res.status(201).send({ message: "User created successfully", user })
  } catch (error) {
    return res.status(500).send({ message: "Error creating user", error })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();

    return res.status(200).send({ message: "Users fetched successfully", users })
  } catch (error) {
    return res.status(500).send({ message: "Error fetching users", error })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select('-password').populate('roles');

    if (!user) {
      return res.status(404).send({ message: "User not found" })
    }
    return res.status(200).send({ message: "User profile fetched successfully", user })
  } catch (error) {
    return res.status(500).send({ message: "Error fetching user profile", error })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).send({ message: "User not found", error })
    }

    return res.status(200).send({ message: "User fetched successfully", user })
  } catch (error) {
    return res.status(500).send({ message: "Error fetching user", error })
  }
}

export const deactivateUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    return res.status(200).send({ message: "User deactivated successfully", user })
  } catch (error) {
    return res.status(500).send({ message: "Error deactivating user", error })
  }

  // Notify employee
  await notifyUser(
    req.params.id,
    'email',
    'REVIEW',
    'Account Deactivated',
    `Your account as been deactivated.`,
  );

  const employee = await employeeModel.findOne({ user: user._id });

  await AuditLog.create({
    user: user._id,
    action: 'DEACTIVATE_USER',
    entityType: 'User',
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    performedBy: employee._id,
    entityId: user._id,
    oldData: { password: oldPassword },
    newData: { password: newPassword }
  });
}

export const activateUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, { active: true }, { new: true });
    return res.status(200).send({ message: "User activated successfully", user })
  } catch (error) {
    return res.status(500).send({ message: "Error activating user", error })
  }

  // Notify employee
  await notifyUser(
    req.params.id,
    'email',
    'REVIEW',
    'Account Activated',
    `Your account has been activated.`,
  );

  const employee = await employeeModel.findOne({ user: user._id });

  await AuditLog.create({
    user: user._id,
    action: 'ACTIVATE_USER',
    entityType: 'User',
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    performedBy: employee._id,
    entityId: user._id,
    oldData: { password: oldPassword },
    newData: { password: newPassword }
  });
}