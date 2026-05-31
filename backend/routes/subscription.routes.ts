import express from 'express';
import { subscribeToAlerts } from '../controllers/subscriptions.controller';

const router = express.Router();

router.post('/', subscribeToAlerts);

export default router;