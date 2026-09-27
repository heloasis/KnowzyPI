const { db } = require('../config/firebase');

const buscarPerguntas = async () => {
  const snapshot = await db.ref('perguntas').once('value');
  const perguntas = snapshot.val() || {};

  return Object.entries(perguntas).map(([id, value]) => ({ id, ...value }));
};

const buscarPergunta = async (id) => {
  const snapshot = await db.ref(`perguntas/${id}`).once('value');
  const pergunta = snapshot.val();

  if (!pergunta) {
    return null;
  }

  return { id, ...pergunta };
};

const buscarPerguntasPorMateria = async (materiaId) => {
  const snapshot = await db.ref('perguntas').once('value');
  const perguntas = snapshot.val() || {};

  return Object.entries(perguntas)
    .filter(([, value]) => value.materiaId === materiaId)
    .map(([id, value]) => ({ id, ...value }));
};

const verificarResposta = async (perguntaId, resposta) => {
  const pergunta = await buscarPergunta(perguntaId);

  if (!pergunta) {
    return { correta: false, mensagem: 'Pergunta não encontrada.' };
  }

  const correta = pergunta.respostaCorreta === resposta;

  return {
    correta,
    perguntaId,
    respostaSelecionada: resposta,
    respostaCorreta: pergunta.respostaCorreta,
    mensagem: correta ? 'Resposta correta!' : 'Resposta incorreta.'
  };
};

const calcularResultado = async (usuarioId, materiaId, respostas) => {
  const perguntas = await buscarPerguntasPorMateria(materiaId);
  const total = perguntas.length;
  const acertos = respostas.filter((resposta) => {
    const pergunta = perguntas.find((item) => item.id === resposta.perguntaId);
    return pergunta && pergunta.respostaCorreta === resposta.resposta;
  }).length;

  return {
    usuarioId,
    materiaId,
    totalPerguntas: total,
    acertos,
    percentual: total > 0 ? Math.round((acertos / total) * 100) : 0,
    mensagem: 'Quiz finalizado.'
  };
};

const criarPergunta = async (dados) => {
  const ref = db.ref('perguntas').push();
  const id = ref.key;
  await ref.set(dados);
  return { id, ...dados };
};

const atualizarPergunta = async (id, dados) => {
  await db.ref(`perguntas/${id}`).update(dados);
  return buscarPergunta(id);
};

const excluirPergunta = async (id) => {
  await db.ref(`perguntas/${id}`).remove();
  return { mensagem: 'Pergunta excluída com sucesso.' };
};

module.exports = {
  buscarPerguntas,
  buscarPergunta,
  buscarPerguntasPorMateria,
  verificarResposta,
  calcularResultado,
  criarPergunta,
  atualizarPergunta,
  excluirPergunta
};