import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  getEducationModules,
  createEducationModule,
  updateEducationModule,
  deleteEducationModule
} from '../controllers/education.controller';

import {
  authenticateToken,
  requireAdmin
} from '../middleware/auth.middleware';

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    _req: express.Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir);
  },

  filename: (
    _req: express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname);

    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (
  _req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedImageTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ];

  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.fieldname === 'portada' || file.fieldname === 'imagenes') {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(new Error('La portada e imágenes adicionales deben ser PNG, JPG, JPEG o WEBP.'));
    }

    return cb(null, true);
  }

  if (file.fieldname === 'archivo') {
    if (!allowedDocumentTypes.includes(file.mimetype)) {
      return cb(new Error('El archivo adjunto debe ser PDF, DOC o DOCX.'));
    }

    return cb(null, true);
  }

  return cb(new Error('Campo de archivo no permitido.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 12
  }
});

const uploadEducationFiles = upload.fields([
  {
    name: 'portada',
    maxCount: 1
  },
  {
    name: 'archivo',
    maxCount: 1
  },
  {
    name: 'imagenes',
    maxCount: 10
  }
]);

router.get('/', getEducationModules);

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  uploadEducationFiles,
  createEducationModule
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  uploadEducationFiles,
  updateEducationModule
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  deleteEducationModule
);

export default router;