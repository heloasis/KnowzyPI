const express = require('express');
const router = express.Router();

const materiaController = require('../controllers/materiasController');

router.get('/', materiaController.listarMaterias);
router.get('/:id', materiaController.buscarMateria);

module.exports = router;