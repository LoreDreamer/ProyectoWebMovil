const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // 🌟 Módulo nativo de Node para manejar archivos y carpetas

// 🌟 Truco: Si la carpeta 'uploads' no existe, Node la creará automáticamente aquí
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ahora estamos 100% seguros de que esta carpeta existe
  },
  filename: (req, file, cb) => {
    // Nombre único usando la fecha actual
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Importamos las funciones del controlador
const { obtenerDenuncias, crearDenuncia } = require('../controllers/complaintsController');

// Rutas unidas al middleware upload
router.get('/', obtenerDenuncias);
router.post('/', upload.single('archivo'), crearDenuncia);

module.exports = router;