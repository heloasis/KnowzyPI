
const biologia = require('../data/biologia.json');
const geografia = require('../data/geografia.json');
const historia = require('../data/historia.json');
const matematica = require('../data/matematica.json');
const portugues = require('../data/portugues.json');

const { isCorrectAnswer } = require('../services/answerNormalizer');

const bancoLocal = {
  biologia,
  geografia,
  historia,
  matematica,
  portugues
};

const normalizarPergunta = (id, value = {}) => ({
  ...value,
  id: String(id),
  respostaCorreta:
    value.respostaCorreta ??
    value.resposta_correta ??
    value.correctAnswer ??
    value.correct_answer
});

const converterParaLista = (dados) => {
  if (Array.isArray(dados)) {
    return dados.map((pergunta, index) =>
      normalizarPergunta(pergunta.id || `p${index + 1}`, pergunta)
    );
  }

  if (!dados || typeof dados !== 'object') {
    return [];
  }

  return Object.entries(dados).map(([id, pergunta]) =>
    normalizarPergunta(id, pergunta)
  );
};

const buscarPerguntasPorMateria = async (materiaId) => {
  const materia = String(materiaId || '').toLowerCase();

  return converterParaLista(bancoLocal[materia]);
};

const buscarPerguntas = async () => {
  return Object.entries(bancoLocal).flatMap(([materiaId, dados]) =>
    converterParaLista(dados).map((pergunta) => ({
      ...pergunta,
      materiaId
    }))
  );
};

const buscarPergunta = async (id, materiaId) => {
  if (materiaId) {
    const perguntas = await buscarPerguntasPorMateria(materiaId);

    return perguntas.find(
      (pergunta) => String(pergunta.id) === String(id)
    ) || null;
  }

  const todas = await buscarPerguntas();

  return todas.find(
    (pergunta) => String(pergunta.id) === String(id)
  ) || null;
};

const verificarResposta = async (perguntaId, resposta, materiaId) => {
  const pergunta = await buscarPergunta(perguntaId, materiaId);

  if (!pergunta) {
    return {
      correta: false,
      mensagem: 'Pergunta não encontrada.'
    };
  }

  const correta = isCorrectAnswer(pergunta, resposta);

  return {
    correta,
    perguntaId,
    mensagem: correta
      ? 'Resposta correta!'
      : 'Resposta incorreta.'
  };
};

const calcularResultado = async (usuarioId, materiaId, respostas) => {
  const perguntas = await buscarPerguntasPorMateria(materiaId);
  const respostasUnicas = new Map();

  for (const resposta of respostas || []) {
    if (
      resposta?.perguntaId &&
      !respostasUnicas.has(String(resposta.perguntaId))
    ) {
      respostasUnicas.set(String(resposta.perguntaId), resposta);
    }
  }

  let acertos = 0;

  for (const [perguntaId, resposta] of respostasUnicas) {
    const pergunta = perguntas.find(
      (item) => String(item.id) === perguntaId
    );

    if (
      pergunta &&
      isCorrectAnswer(pergunta, resposta.resposta)
    ) {
      acertos++;
    }
  }

  return {
    usuarioId,
    materiaId,
    totalPerguntas: perguntas.length,
    acertos,
    percentual: perguntas.length
      ? Math.round((acertos / perguntas.length) * 100)
      : 0,
    xpGanho: acertos * 5,
    mensagem: 'Quiz finalizado.'
  };
};

module.exports = {
  buscarPerguntasPorMateria,
  buscarPerguntas,
  buscarPergunta,
  verificarResposta,
  calcularResultado
};
