const express = require('express');
const router = express.Router();

// Importamos las funciones desde el controlador
const { register, login } = require('../controllers/auth.controller');

// Definimos los endpoints y les pasamos su función correspondiente
router.post('/register', register);
router.post('/login', login);

module.exports = router;