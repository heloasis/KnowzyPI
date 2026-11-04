
const express = require('express');

const userController = require('../controllers/userController');
const { requireAuth, requireOwnership } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(requireAuth);
router.get('/:id', requireOwnership('id'), userController.buscarPerfil);
router.put('/:id', requireOwnership('id'), userController.atualizarPerfil);
router.get('/:id/conquistas', requireOwnership('id'), userController.buscarConquistas);

module.exports = router;
