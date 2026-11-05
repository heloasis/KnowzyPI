const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');

router.post('/finalizar', quizController.finalizarQuiz);

module.exports = router;
