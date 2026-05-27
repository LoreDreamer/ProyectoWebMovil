import express from 'express';
import {
  register,
  login,
  me,
  getUsers
} from '../controllers/auth.controller';
import {
  authenticateToken,
  requireAdmin
} from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.get('/users', authenticateToken, requireAdmin, getUsers);

export default router;