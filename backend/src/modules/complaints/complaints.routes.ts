import express from 'express';
import multer from 'multer';
import {
  crearDenuncia,
  eliminarDenuncia,
  obtenerDenuncias
} from './complaints.controller';
import {
  authenticateToken,
  requireAdmin
} from '../../middlewares/auth.middleware';
import { formRateLimit } from '../../middlewares/rateLimit.middleware';

const router = express.Router();

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 10;

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const allowedExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.pdf',
  '.doc',
  '.docx',
  '.txt'
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
    files: MAX_FILES
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
          'Formato de archivo no permitido. Solo se permiten imágenes, PDF, DOC, DOCX o TXT.'
        )
      );
    }

    return cb(null, true);
  }
});

const uploadComplaintFiles = upload.fields([
  { name: 'archivo', maxCount: MAX_FILES },
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

router.get('/', authenticateToken, requireAdmin, obtenerDenuncias);
router.delete('/:id', authenticateToken, requireAdmin, eliminarDenuncia);

router.post(
  '/',
  formRateLimit,
  uploadComplaintFiles,
  handleMulterError,
  crearDenuncia
);

export default router;