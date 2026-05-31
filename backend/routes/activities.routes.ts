import express from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from '../controllers/activities.controller';
import {
  authenticateToken,
  requireAdmin
} from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticateToken, getActivities);
router.post('/', authenticateToken, requireAdmin, createActivity);
router.put('/:id', authenticateToken, requireAdmin, updateActivity);
router.delete('/:id', authenticateToken, requireAdmin, deleteActivity);

export default router;