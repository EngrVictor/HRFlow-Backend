import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import AuditLog from '../models/AuditLog.js';
import { notifyUser, notifyManyUsers } from '../services/notificationService.js';
import employeeModel from "../models/Employee.js";


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const mustChangePassword = user.mustChangePassword || false;
    if (mustChangePassword) {
      return res.status(403).json({ error: 'Password reset required', mustChangePassword: true });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ error: 'Account disabled' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.email);
    res.json({ token, userId: user._id });

    const employee = await employeeModel.findOne({ user: user._id });

    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      entityType: 'authentication',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      performedBy: employee._id,
      entityId: user._id,
      newData: { email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', Error: err.message });
  }
};

export const setPassword = async (req, res) => {
  const { email, oldPassword, newPassword, token } = req.body; // token from password reset or email verification
  // Verify token (simplified)
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.mustChangePassword === false) {
    return res.status(400).json({ error: 'Password already set' });
  }

  if (oldPassword !== user.password) {
    return res.status(401).json({ error: 'Invalid temporary password' });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.authProviders.email = true;
  user.mustChangePassword = false;
  await user.save();
  res.json({ message: 'Password created. You can now log in with email/password.' });

  const employee = await employeeModel.findOne({ user: user._id });

  await notifyUser(
    employee._id,
    'email',
    'RECRUITMENT',
    'Password set for new employee',
    'Your password has been set. Please log in to your account.',
    {
      relatedEntityType: 'User',
      relatedEntityId: user._id,
      metadata: { employeeName: `${employee.firstName} ${employee.lastName}` }
    }
  );


  await AuditLog.create({
    user: user._id,
    action: 'PASSWORD_SET',
    entityType: 'authentication',
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
    performedBy: employee._id,
    entityId: user._id,
    oldData: { password: oldPassword },
    newData: { password: newPassword }
  });
};

export const linkProvider = async (req, res) => {
  const { provider } = req.params; // 'google' or 'apple'
  const { providerId, email } = req.body; // obtained from frontend after provider auth
  const currentUser = req.user; // from authMiddleware

  // Check if this providerId is already linked to another user
  const existing = await User.findOne({ [`${provider}Id`]: providerId });
  if (existing && existing._id.toString() !== currentUser._id.toString()) {
    return res.status(409).json({ error: `This ${provider} account is already linked to another user` });
  }

  // Link
  currentUser[`${provider}Id`] = providerId;
  currentUser.authProviders[provider] = true;

  // If the provider gives an email and current user has no email, update it
  if (email && !currentUser.email) {
    currentUser.email = email;
  }

  await currentUser.save();
  res.json({ message: `${provider} account linked successfully` });
}