import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ⚠️ REVISA ESTA LÍNEA: Asegúrate de que tu archivo en controllers se llame exactamente "complaints.controller.ts"
import { obtenerDenuncias, crearDenuncia } from '../controllers/complaints.controller';

const router = express.Router();

const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Agregamos tipos explícitos para que TypeScript no se queje jamás
const storage = multer.diskStorage({
  destination: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', obtenerDenuncias);
router.post('/', upload.single('archivo'), crearDenuncia);

export default router;