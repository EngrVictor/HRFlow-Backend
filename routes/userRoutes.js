import express from 'express';
import { getMe, createUser, getAllUsers, getUserById, deactivateUser, activateUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = express.Router();

router.use(authMiddleware); // all user routes require auth

router.get('/me', getMe);
router.post('/', requireRoles('admin', 'hr_manager', 'manager'), createUser);
router.get('/', requireRoles('admin', 'hr_manager'), getAllUsers);
router.get('/:id', requireRoles('admin', 'hr_manager', 'manager'), getUserById);
router.put('/:id/deactivate', requireRoles('admin', 'hr_manager'), deactivateUser);
router.put('/:id/reactivate', requireRoles('admin', 'hr_manager'), activateUser);

export default router;