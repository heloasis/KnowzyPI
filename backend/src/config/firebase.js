const crypto = require('crypto');

const state = {
  usuarios: {
    u1: {
      nome: 'Aluno Teste',
      email: 'aluno@teste.com',
      senha: '$2b$12$AuK34YNENfGlzae/veGNs.bUj2JrnHPPI393yxWjxS.5yuWBOu.f.',
      conquistas: ['Primeiro Acesso']
    }
  },
  materias: {
    matematica: {
      nome: 'Matemática',
      descricao: 'Operações e lógica',
      perguntas: {
        q1: {
          enunciado: 'Quanto é 2 + 2?',
          alternativas: ['3', '4', '5', '6'],
          respostaCorreta: '4'
        },
        q2: {
          enunciado: 'Qual é a raiz quadrada de 9?',
          alternativas: ['2', '3', '4', '5'],
          respostaCorreta: '3'
        }
      }
    },
    portugues: {
      nome: 'Português',
      descricao: 'Interpretação e gramática',
      perguntas: {
        q3: {
          enunciado: 'Qual palavra está corretamente grafada?',
          alternativas: ['Acessorio', 'Acessório', 'Acessorio', 'Acessóro'],
          respostaCorreta: 'Acessório'
        },
        q4: {
          enunciado: 'Qual termo está em destaque em “Ele foi ao mercado e comprou pão”?',
          alternativas: ['Verbo', 'Substantivo', 'Pronome', 'Adjetivo'],
          respostaCorreta: 'Pronome'
        }
      }
    },
    historia: {
      nome: 'História',
      descricao: 'Fatos e civilizações',
      perguntas: {
        q5: {
          enunciado: 'Quem foi o responsável pela chegada do homem à Lua?',
          alternativas: ['Neil Armstrong', 'Yuri Gagarin', 'Buzz Aldrin', 'John Glenn'],
          respostaCorreta: 'Neil Armstrong'
        }
      }
    },
    geografia: {
      nome: 'Geografia',
      descricao: 'Mapas e territórios',
      perguntas: {
        q6: {
          enunciado: 'Qual é o maior oceano do planeta?',
          alternativas: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'],
          respostaCorreta: 'Pacífico'
        }
      }
    },
    biologia: {
      nome: 'Biologia',
      descricao: 'Seres vivos e ecologia',
      perguntas: {
        q7: {
          enunciado: 'Qual órgão do corpo humano bombeia o sangue?',
          alternativas: ['Pulmão', 'Coração', 'Fígado', 'Rim'],
          respostaCorreta: 'Coração'
        }
      }
    }
  },
  perguntas: {
    p1: {
      materiaId: 'matematica',
      enunciado: 'Quanto é 2 + 2?',
      alternativas: ['3', '4', '5', '6'],
      respostaCorreta: '4'
    },
    p2: {
      materiaId: 'matematica',
      enunciado: 'Qual é a raiz quadrada de 9?',
      alternativas: ['2', '3', '4', '5'],
      respostaCorreta: '3'
    },
    p3: {
      materiaId: 'portugues',
      enunciado: 'Qual palavra está corretamente grafada?',
      alternativas: ['Acessorio', 'Acessório', 'Acessorio', 'Acessóro'],
      respostaCorreta: 'Acessório'
    },
    p4: {
      materiaId: 'historia',
      enunciado: 'Qual evento foi marcado em 1492?',
      alternativas: ['Descoberta do Brasil', 'Chegada de Colombo à América', 'Revolução Francesa', 'Queda do Império Romano'],
      respostaCorreta: 'Chegada de Colombo à América'
    },
    p5: {
      materiaId: 'geografia',
      enunciado: 'Qual é o maior oceano do planeta?',
      alternativas: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'],
      respostaCorreta: 'Pacífico'
    },
    p6: {
      materiaId: 'biologia',
      enunciado: 'Qual órgão do corpo humano bombeia o sangue?',
      alternativas: ['Pulmão', 'Coração', 'Fígado', 'Rim'],
      respostaCorreta: 'Coração'
    }
  }
};

const makeDoc = (id, data) => ({
  id,
  exists: !!data,
  data: () => data,
  ref: { id }
});

const getValueAtPath = (path) => {
  const segments = path.split('/').filter(Boolean);
  let value = state;

  for (const segment of segments) {
    if (!value || typeof value !== 'object' || !(segment in value)) {
      return null;
    }
    value = value[segment];
  }

  return value;
};

const ref = (path) => {
  const data = getValueAtPath(path);

  const setAtPath = (value) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) {
      return;
    }

    let current = state;
    for (let i = 0; i < segments.length - 1; i += 1) {
      const segment = segments[i];
      if (!current[segment] || typeof current[segment] !== 'object') {
        current[segment] = {};
      }
      current = current[segment];
    }

    current[segments[segments.length - 1]] = value;
  };

  return {
    once: async () => ({
      val: () => data
    }),
    child: (childPath) => ref(`${path}/${childPath}`),
    set: async (value) => {
      setAtPath(value);
      return true;
    },
    update: async (value) => {
      const nextValue = typeof data === 'object' && data !== null ? { ...data, ...value } : value;
      setAtPath(nextValue);
      return true;
    }
  };
};

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
      get: async () => {
        const docs = Object.entries(data)
          .filter(([, item]) => {
            if (operator !== '==') return false;
            return item[field] === value;
          })
          .map(([id, item]) => ({ id, data: () => item }));

        return {
          docs,
          empty: docs.length === 0,
          forEach: (callback) => docs.forEach((doc) => callback(doc))
        };
      }
    })
  };
};

module.exports = { db: { collection, ref } };
