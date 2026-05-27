import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import {
  obtenerDenuncias,
  crearDenuncia
} from '../controllers/complaints.controller';

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

  const extension = path.extname(file.originalname).toLowerCase();

  const validByMime = allowedMimeTypes.includes(file.mimetype);
  const validByExtension = allowedExtensions.includes(extension);

  if (!validByMime && !validByExtension) {
    return cb(
      new Error(
        'Solo se permiten imágenes, PDF, DOC, DOCX o TXT. No se permiten ejecutables ni archivos comprimidos.'
      )
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  }
});

const uploadDenunciaFiles = upload.fields([
  {
    name: 'archivo',
    maxCount: 10
  },
  {
    name: 'archivos',
    maxCount: 10
  }
]);

const handleUploadDenunciaFiles = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  uploadDenunciaFiles(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Uno de los archivos supera el límite de 10 MB.'
        });
      }

      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Solo puedes adjuntar un máximo de 10 archivos.'
        });
      }

      return res.status(400).json({
        error: 'Error al subir archivos.',
        message: error.message
      });
    }

    return res.status(400).json({
      error: 'Archivo no permitido.',
      message: error.message || 'Tipo de archivo no válido.'
    });
  });
};

/*
  GET queda protegido porque las denuncias contienen datos personales.
  POST queda público para que cualquier ciudadano pueda enviar una denuncia.
*/
router.get('/', authenticateToken, requireAdmin, obtenerDenuncias);
router.post('/', handleUploadDenunciaFiles, crearDenuncia);

export default router;