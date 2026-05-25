const express = require('express');
const router = express.Router();

const {
  getProtocolos,
  createProtocolo
} = require('../controllers/protocolos.controller');

router.get('/', getProtocolos);

router.post('/', createProtocolo);

module.exports = router;