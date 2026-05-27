import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  getProtocolos,
  createProtocolo,
  updateProtocolo,
  deleteProtocolo
} from '../controllers/protocolos.controller';

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
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        'Solo se permiten archivos PDF, DOC, DOCX o imágenes PNG, JPG, JPEG y WEBP.'
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  }
});

const uploadProtocolFiles = upload.fields([
  {
    name: 'archivo',
    maxCount: 1
  },
  {
    name: 'archivos',
    maxCount: 10
  }
]);

router.get('/', getProtocolos);

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  uploadProtocolFiles,
  createProtocolo
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  uploadProtocolFiles,
  updateProtocolo
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  deleteProtocolo
);

export default router;