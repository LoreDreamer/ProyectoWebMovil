import express from 'express';
// Importamos las funciones desestructuradas directamente de nuestro controlador tipado
import { register, login, me } from '../controllers/auth.controller';
// Este middleware lo cambiaremos pronto, pero lo importamos de forma compatible
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);

// En TypeScript/ES Modules se acostumbra usar export default para el enrutador
export default router;