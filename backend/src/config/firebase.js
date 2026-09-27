const crypto = require('crypto');

const state = {
  usuarios: {
    u1: {
      nome: 'Aluno Teste',
      email: 'aluno@teste.com',
      senha: '123456',
      conquistas: ['Primeiro Acesso']
    }
  },
  materias: {
    m1: { nome: 'Matemática', descricao: 'Operações e lógica' },
    m2: { nome: 'Português', descricao: 'Interpretação e gramática' }
  },
  perguntas: {
    p1: {
      materiaId: 'm1',
      enunciado: 'Quanto é 2 + 2?',
      alternativas: ['3', '4', '5', '6'],
      respostaCorreta: '4'
    },
    p2: {
      materiaId: 'm1',
      enunciado: 'Qual é a raiz quadrada de 9?',
      alternativas: ['2', '3', '4', '5'],
      respostaCorreta: '3'
    },
    p3: {
      materiaId: 'm2',
      enunciado: 'Qual palavra está corretamente grafada?',
      alternativas: ['Acessorio', 'Acessório', 'Acessorio', 'Acessóro'],
      respostaCorreta: 'Acessório'
    }
  }
};

const makeDoc = (id, data) => ({
  id,
  exists: !!data,
  data: () => data,
  ref: { id }
});

const collection = (name) => {
  const data = state[name] || {};

  const toArray = () => Object.entries(data).map(([id, value]) => ({
    id,
    data: () => value
  }));

  return {
    doc: (id) => ({
      get: async () => {
        if (!data[id]) {
          return { exists: false, id, data: () => undefined };
        }
        return { exists: true, id, data: () => data[id] };
      },
      update: async (payload) => {
        if (!data[id]) {
          data[id] = {};
        }
        data[id] = { ...data[id], ...payload };
        return { id };
      },
      delete: async () => {
        delete data[id];
        return { id };
      }
    }),
    add: async (payload) => {
      const id = crypto.randomUUID();
      data[id] = payload;
      return { id };
    },
    get: async () => ({
      forEach: (callback) => {
        toArray().forEach((doc) => callback(doc));
      },
      docs: toArray()
    }),
    where: (field, operator, value) => ({
      get: async () => ({
        forEach: (callback) => {
          Object.entries(data)
            .filter(([, item]) => {
              if (operator !== '==') return false;
              return item[field] === value;
            })
            .forEach(([id, item]) => callback({ id, data: () => item }));
        }
      })
    })
  };
};

module.exports = { db: { collection } };
