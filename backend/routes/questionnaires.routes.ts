import express from 'express';
import multer from 'multer';

import {
  getQuestionnaires,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  getMyQuestionnaireProgress,
  completeQuestionnaire,
  importQuestionnaireExercises,
  getQuestionnaireToResolve,
  respondQuestionnaire
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

const allowedCsvMimeTypes = [
  'text/csv',
  'text/plain',
  'application/csv',
  'application/vnd.ms-excel'
];

const allowedCsvExtensions = ['.csv', '.txt'];

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

const uploadCsv = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    const extension = getFileExtension(file.originalname);

    const isValidCsv =
      allowedCsvMimeTypes.includes(file.mimetype) ||
      allowedCsvExtensions.includes(extension);

    if (!isValidCsv) {
      return cb(
        new Error(
          'Formato de CSV no permitido. Solo se permiten archivos CSV o TXT.'
        )
      );
    }

    return cb(null, true);
  }
});

const uploadQuestionnaireFiles = upload.fields([
  { name: 'portada', maxCount: 1 },
  { name: 'archivo', maxCount: 1 },
  { name: 'imagenes', maxCount: MAX_IMAGES }
]);

const uploadCsvFile = uploadCsv.single('csv');

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
/* RUTAS DE PROGRESO Y RESOLUCIÓN */
/* =============================== */

router.get('/progress/me', authenticateToken, getMyQuestionnaireProgress);

router.get('/:id/resolver', authenticateToken, getQuestionnaireToResolve);

router.post('/:id/responder', authenticateToken, respondQuestionnaire);

router.post('/:id/complete', authenticateToken, completeQuestionnaire);

/* =============================== */
/* RUTAS ADMIN */
/* =============================== */

router.post(
  '/:id/importar-ejercicios',
  authenticateToken,
  requireAdmin,
  uploadCsvFile,
  handleMulterError,
  importQuestionnaireExercises
);

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
