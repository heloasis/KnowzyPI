const https = require('https');
const { db } = require('../config/firebase');

const FIREBASE_BASE_URL = 'https://knowzypi-default-rtdb.firebaseio.com';

const buscarDadosFirebase = async (path) => {
  return new Promise((resolve, reject) => {
    const url = `${FIREBASE_BASE_URL}/${path}.json`;

    https
      .get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode >= 400) {
            reject(new Error(`Firebase retornou status ${response.statusCode}`));
            return;
          }

          try {
            resolve(data ? JSON.parse(data) : null);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });
};

const buscarPerguntas = async () => {
  try {
    const materias = await buscarDadosFirebase('materias');
    if (materias && typeof materias === 'object') {
      const perguntas = Object.values(materias)
        .flatMap((materia) => {
          const listaPerguntas = materia?.perguntas || {};
          return Object.entries(listaPerguntas).map(([id, value]) => ({ id, ...value }));
        });

      if (perguntas.length) {
        return perguntas;
      }
    }
  } catch (error) {
    console.warn('Falha ao buscar perguntas do Firebase:', error.message);
  }

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
  const materiaKey = materiaId === 'matematica' ? 'matematica' : materiaId;

  try {
    const perguntas = await buscarDadosFirebase(`materias/${materiaKey}/perguntas`);

    if (perguntas && typeof perguntas === 'object') {
      return Object.entries(perguntas).map(([id, value]) => ({ id, ...value }));
    }
  } catch (error) {
    console.warn(`Falha ao buscar perguntas da matéria ${materiaKey}:`, error.message);
  }

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