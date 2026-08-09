const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.index);
router.get('/login', authController.login);
router.get('/cadastro', authController.cadastro);

module.exports = router;