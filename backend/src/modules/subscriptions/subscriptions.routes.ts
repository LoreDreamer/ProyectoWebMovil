import express from 'express';
import { subscribeToAlerts } from './subscriptions.controller';
import { subscriptionRateLimit } from '../../middlewares/rateLimit.middleware';

const router = express.Router();

router.post('/', subscriptionRateLimit, subscribeToAlerts);

export default router;