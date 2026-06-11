import { Router } from 'express';
import { checkUrlSecurity } from './security.controller';
import { securityToolsRateLimit } from '../../middlewares/rateLimit.middleware';

const router = Router();

router.post('/url-check', securityToolsRateLimit, checkUrlSecurity);

export default router;
