const quizModel = require('../models/perguntas');

const iniciarQuiz = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const perguntas = await quizModel.buscarPerguntasPorMateria(materiaId);

    if (!perguntas || perguntas.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma pergunta encontrada.' });
    }

    res.status(200).json({ materia: materiaId, perguntas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao iniciar o quiz.' });
  }
};

const responderPergunta = async (req, res) => {
  try {
    const { perguntaId, resposta } = req.body;

    if (!perguntaId || resposta === undefined) {
      return res.status(400).json({ erro: 'Pergunta e resposta são obrigatórias.' });
    }

    const resultado = await quizModel.verificarResposta(perguntaId, resposta);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao verificar resposta.' });
  }
};

const finalizarQuiz = async (req, res) => {
  try {
    const { usuarioId, materiaId, respostas } = req.body;

    if (!usuarioId || !materiaId || !respostas) {
      return res.status(400).json({ erro: 'Dados do resultado incompletos.' });
    }

    const resultado = await quizModel.calcularResultado(usuarioId, materiaId, respostas);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao finalizar o quiz.' });
  }
};

module.exports = {
  iniciarQuiz,
  responderPergunta,
  finalizarQuiz
};