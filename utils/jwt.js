import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '1d';

// Generate token for a user
export const generateToken = (userId, email) => {
  return jwt.sign(
    { sub: userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Verify token (returns decoded payload or throws error)
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
}

