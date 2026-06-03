import { verifyToken } from '../utils/jwt.js'
import User from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch user from DB to ensure still exists & active
    const user = await User.findById(decoded.sub)
      .select('-passwordHash') // exclude password
      .lean(); // plain JS object

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User inactive or not found' });
    }

    // Attach user to request for later use in RBAC
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}