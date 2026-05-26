import express from 'express';
// Importamos las funciones del controlador que migramos previamente
import { getProtocolos, createProtocolo } from '../controllers/protocolos.controller';
// Importamos los middlewares de seguridad correspondientes
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Ruta pública o protegida según tu requerimiento (en este caso, libre para lectura)
router.get('/', getProtocolos);

// Ruta protegida: requiere token válido Y rol de administrador para crear un protocolo
router.post('/', authenticateToken, requireAdmin, createProtocolo);

export default router;