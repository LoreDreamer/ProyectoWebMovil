import express from 'express';
import multer from 'multer';

import {
  getQuestionnaires,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  getMyQuestionnaireProgress,
  completeQuestionnaire
} from '../controllers/questionnaires.controller';

import {
  authenticateToken,
  requireAdmin
} from '../middleware/auth.middleware';

const router = express.Router();

const MAX_FILE_SIZE_MB = 10;
const MAX_IMAGES = 10;

const allowedImageMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

const allowedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

const allowedDocumentMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const allowedDocumentExtensions = ['.pdf', '.doc', '.docx'];

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
    files: MAX_IMAGES + 2
  },
  fileFilter: (_req, file, cb) => {
    const extension = getFileExtension(file.originalname);

    const isImageField =
      file.fieldname === 'portada' || file.fieldname === 'imagenes';

    const isDocumentField = file.fieldname === 'archivo';

    const isValidImage =
      allowedImageMimeTypes.includes(file.mimetype) ||
      allowedImageExtensions.includes(extension);

    const isValidDocument =
      allowedDocumentMimeTypes.includes(file.mimetype) ||
      allowedDocumentExtensions.includes(extension);

    if (isImageField && !isValidImage) {
      return cb(
        new Error(
          'Formato de imagen no permitido. Solo se permiten PNG, JPG, JPEG o WEBP.'
        )
      );
    }

    if (isDocumentField && !isValidDocument) {
      return cb(
        new Error(
          'Formato de documento no permitido. Solo se permiten PDF, DOC o DOCX.'
        )
      );
    }

    if (!isImageField && !isDocumentField) {
      return cb(new Error(`Campo de archivo no permitido: ${file.fieldname}`));
    }

    return cb(null, true);
  }
});

const uploadQuestionnaireFiles = upload.fields([
  { name: 'portada', maxCount: 1 },
  { name: 'archivo', maxCount: 1 },
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

/* =============================== */
/* RUTAS PÚBLICAS */
/* =============================== */

router.get('/', getQuestionnaires);

/* =============================== */
/* RUTAS DE PROGRESO USUARIO */
/* =============================== */

router.get('/progress/me', authenticateToken, getMyQuestionnaireProgress);

router.post('/:id/complete', authenticateToken, completeQuestionnaire);

/* =============================== */
/* RUTAS ADMIN */
/* =============================== */

router.post(
  '/',
  authenticateToken,
  requireAdmin,
  uploadQuestionnaireFiles,
  handleMulterError,
  createQuestionnaire
);

router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  uploadQuestionnaireFiles,
  handleMulterError,
  updateQuestionnaire
);

router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  deleteQuestionnaire
);

export default router;
