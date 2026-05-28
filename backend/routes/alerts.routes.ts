import express from 'express';
import multer from 'multer';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../controllers/alerts.controller';
import {
  authenticateToken,
  requireAdmin
} from '../middleware/auth.middleware';

const router = express.Router();

const MAX_FILE_SIZE_MB = 10;
const MAX_IMAGES = 10;

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

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
    files: MAX_IMAGES + 1
  },
  fileFilter: (_req, file, cb) => {
    const extension = getFileExtension(file.originalname);

    const isValidFile =
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(extension);

    if (!isValidFile) {
      return cb(
        new Error(
          'Formato de imagen no permitido. Solo se permiten PNG, JPG, JPEG o WEBP.'
        )
      );
    }

    return cb(null, true);
  }
});

const uploadAlertFiles = upload.fields([
  { name: 'portada', maxCount: 1 },
  { name: 'imagen', maxCount: 1 },
  { name: 'imagenes', maxCount: MAX_IMAGES }
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

router.get('/', getAlerts);

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  uploadAlertFiles,
  handleMulterError,
  createAlert
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  uploadAlertFiles,
  handleMulterError,
  updateAlert
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  deleteAlert
);

export default router;