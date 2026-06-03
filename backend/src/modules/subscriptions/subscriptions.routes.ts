import express from 'express';
import { subscribeToAlerts } from './subscriptions.controller';

const router = express.Router();

router.post('/', subscribeToAlerts);

export default router;