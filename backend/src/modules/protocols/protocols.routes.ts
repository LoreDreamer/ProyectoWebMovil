import express from 'express';
import multer from 'multer';

import {
  getProtocolos,
  createProtocolo,
  updateProtocolo,
  deleteProtocolo
} from './protocols.controller';

import {
  authenticateToken,
  requireAdmin
} from '../../middlewares/auth.middleware';

const router = express.Router();

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 10;

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

const allowedExtensions = [
  '.pdf',
  '.doc',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp'
];

const getFileExtension = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.');

  if (lastDot === -1) return '';

  return fileName.substring(lastDot).toLowerCase();
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: MAX_FILES + 1
  },
  fileFilter: (_req, file, cb) => {
    const extension = getFileExtension(file.originalname);

    const isAllowedField =
      file.fieldname === 'archivo' || file.fieldname === 'archivos';

    const isValidFile =
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(extension);

    if (!isAllowedField) {
      return cb(new Error(`Campo de archivo no permitido: ${file.fieldname}`));
    }

    if (!isValidFile) {
      return cb(
        new Error(
          'Formato de archivo no permitido. Solo se permiten PDF, DOC, DOCX, PNG, JPG, JPEG o WEBP.'
        )
      );
    }

    return cb(null, true);
  }
});

const uploadProtocolFiles = upload.fields([
  { name: 'archivo', maxCount: 1 },
  { name: 'archivos', maxCount: MAX_FILES }
]);

const handleMulterError = (
  err: unknown,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: 'Error al subir archivo.',
      error: err.message
    });
  }

  if (err instanceof Error) {
    return res.status(400).json({
      message: 'Archivo no válido.',
      error: err.message
    });
  }

  return res.status(400).json({
    message: 'Error desconocido al subir archivo.'
  });
};

router.get('/', getProtocolos);

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  uploadProtocolFiles,
  handleMulterError,
  createProtocolo
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  uploadProtocolFiles,
  handleMulterError,
  updateProtocolo
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  deleteProtocolo
);

export default router;