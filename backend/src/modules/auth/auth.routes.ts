import express from 'express';
import {
  register,
  login,
  me,
  getUsers,
  updateUser,
  deleteUser
} from './auth.controller';
import {
  authenticateToken,
  requireAdmin
} from '../../middlewares/auth.middleware';
import { authRateLimit } from '../../middlewares/rateLimit.middleware';

const router = express.Router();

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.get('/me', authenticateToken, me);
router.get('/users', authenticateToken, requireAdmin, getUsers);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

export default router;