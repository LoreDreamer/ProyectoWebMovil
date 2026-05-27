import express from 'express';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../controllers/alerts.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getAlerts);
router.post('/', authenticateToken, requireAdmin, createAlert);
router.put('/:id', authenticateToken, requireAdmin, updateAlert);
router.delete('/:id', authenticateToken, requireAdmin, deleteAlert);

export default router;