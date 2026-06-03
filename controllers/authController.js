import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ error: 'Account disabled' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.email);
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};