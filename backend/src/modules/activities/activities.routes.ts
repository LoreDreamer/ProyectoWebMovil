import express from 'express';
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from './activities.controller';
import {
  authenticateToken,
  requireAdmin
} from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/', getActivities);
router.post('/', authenticateToken, requireAdmin, createActivity);
router.put('/:id', authenticateToken, requireAdmin, updateActivity);
router.delete('/:id', authenticateToken, requireAdmin, deleteActivity);

export default router;