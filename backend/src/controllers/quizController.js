
const quizModel = require('../models/perguntas');
const userModel = require('../models/user');
const { isCorrectAnswer } = require('../services/answerNormalizer');

const iniciarQuiz = async (req, res) => {
  try {
    const { materiaId } = req.params;
    const perguntas = await quizModel.buscarPerguntasPorMateria(materiaId);

    if (!perguntas || perguntas.length === 0) {
      return res.status(404).json({
        erro: 'Nenhuma pergunta encontrada.'
      });
    }

    res.status(200).json({
      materia: materiaId,
      perguntas
    });
  } catch (error) {
    console.error('Erro ao iniciar quiz:', error);
    res.status(500).json({
      erro: 'Erro ao iniciar o quiz.'
    });
  }
};

const responderPergunta = async (req, res) => {
  try {
    const { perguntaId, resposta, materiaId } = req.body;

    if (!perguntaId || resposta === undefined) {
      return res.status(400).json({
        erro: 'Pergunta e resposta são obrigatórias.'
      });
    }

    const resultado = await quizModel.verificarResposta(
      perguntaId,
      resposta,
      materiaId
    );

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao verificar resposta:', error);
    res.status(500).json({
      erro: 'Erro ao verificar resposta.'
    });
  }
};

const finalizarQuiz = async (req, res) => {
  try {
    const usuarioId = req.session?.user?.id;
    const { materiaId, respostas } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        erro: 'Usuário não autenticado.'
      });
    }

    if (!materiaId || !Array.isArray(respostas)) {
      return res.status(400).json({
        erro: 'Dados do resultado incompletos.'
      });
    }

    const perguntas = await quizModel.buscarPerguntasPorMateria(materiaId);

    if (!perguntas || perguntas.length === 0) {
      return res.status(404).json({
        erro: 'Perguntas da matéria não encontradas.'
      });
    }

    const respostasUnicas = new Map();

    for (const item of respostas) {
      if (
        item?.perguntaId &&
        !respostasUnicas.has(String(item.perguntaId))
      ) {
        respostasUnicas.set(String(item.perguntaId), item);
      }
    }

    const questoesCorretas = [];

    for (const [perguntaId, item] of respostasUnicas) {
      const pergunta = perguntas.find(
        (p) => String(p.id) === perguntaId
      );

      if (pergunta && isCorrectAnswer(pergunta, item.resposta)) {
        questoesCorretas.push(perguntaId);
      }
    }

    const acertos = questoesCorretas.length;
    const totalPerguntas = perguntas.length;

    const percentual = totalPerguntas
      ? Math.round((acertos / totalPerguntas) * 100)
      : 0;

    const quizKey = `${materiaId}:${perguntas.map((p) => String(p.id)).sort().join(',')}`;
    const resultado = await userModel.registrarXpPorPerguntas(
      usuarioId, materiaId, questoesCorretas,
      { quizKey, ultimaPontuacao: percentual }
    );

    if (!resultado) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    if (req.session?.user && resultado.usuario) {
      req.session.user.xp = resultado.usuario.xp;
      req.session.user.conquistas = resultado.usuario.conquistas || [];
      req.session.user.totalQuizzes = resultado.usuario.totalQuizzes || 0;
      req.session.user.materiasExploradas = resultado.usuario.materiasExploradas || [];
    }

    res.status(200).json({
      materiaId,
      totalPerguntas,
      acertos,
      percentual,
      xpGanho: resultado.xpGanho,
      xpTotal: resultado.usuario.xp,
      usuario: resultado.usuario,
      sincronizado: resultado.sincronizado,
      mensagem: 'Quiz finalizado.'
    });

  } catch (error) {
    console.error('Erro ao finalizar quiz:', error);

    res.status(500).json({
      erro: 'Erro ao finalizar o quiz.'
    });
  }
};

module.exports = {
  iniciarQuiz,
  responderPergunta,
  finalizarQuiz
};
