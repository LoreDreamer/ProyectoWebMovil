const express = require('express');
const router = express.Router();

const {
  getProtocolos,
  createProtocolo
} = require('../controllers/protocolos.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.get('/', getProtocolos);

router.post('/', authenticateToken, requireAdmin, createProtocolo);

module.exports = router;