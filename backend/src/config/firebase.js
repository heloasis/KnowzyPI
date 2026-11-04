const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');

const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://knowzypi-default-rtdb.firebaseio.com';

const state = {
  usuarios: {
    u1: {
      nome: 'Aluno Teste',
      email: 'aluno@teste.com',
      senha: '$2b$12$AuK34YNENfGlzae/veGNs.bUj2JrnHPPI393yxWjxS.5yuWBOu.f.',
      xp: 0,
      totalQuizzes: 0,
      materiasExploradas: [],
      ultimaPontuacao: 0,
      conquistas: []
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

const getMockDb = () => {
  const getValueAtPath = (pathValue) => {
    const segments = pathValue.split('/').filter(Boolean);
    let value = state;

    for (const segment of segments) {
      if (!value || typeof value !== 'object' || !(segment in value)) {
        return null;
      }
      value = value[segment];
    }

    return value;
  };

  const ref = (pathValue) => {
    const data = getValueAtPath(pathValue);

    const setAtPath = (value) => {
      const segments = pathValue.split('/').filter(Boolean);
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
      key: pathValue.split('/').filter(Boolean).pop() || null,
      once: async () => ({
        val: () => data
      }),
      child: (childPath) => ref(`${pathValue}/${childPath}`),
      set: async (value) => {
        setAtPath(value);
        return true;
      },
      update: async (value) => {
        const nextValue = typeof data === 'object' && data !== null ? { ...data, ...value } : value;
        setAtPath(nextValue);
        return true;
      },
      push: (value) => {
        const id = crypto.randomUUID();
        const nextPath = `${pathValue}/${id}`;
        const childRef = ref(nextPath);
        if (value !== undefined) {
          childRef.set(value);
        }
        return childRef;
      }
    };
  };

  return { ref };
};

const readServiceAccount = () => {
  const candidates = [
    path.join(__dirname, 'firebaseServiceAccount.json'),
    path.join(process.cwd(), 'src', 'config', 'firebaseServiceAccount.json'),
    path.join(process.cwd(), 'backend', 'src', 'config', 'firebaseServiceAccount.json')
  ];

  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, 'utf8');
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.project_id) {
        return parsed;
      }
    } catch (error) {
      // Ignora arquivos inexistentes ou vazios.
    }
  }

  const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envValue) {
    try {
      const parsed = JSON.parse(envValue);
      if (parsed && parsed.project_id) {
        return parsed;
      }
    } catch (error) {
      // Ignora JSON inválido em ambiente e usa fallback local.
    }
  }

  return null;
};

const initializeRealDatabase = () => {
  const serviceAccount = readServiceAccount();
  const appConfig = { databaseURL: DATABASE_URL };

  if (serviceAccount) {
    appConfig.credential = admin.cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_PROJECT) {
    appConfig.credential = admin.applicationDefault();
  } else {
    return null;
  }

  const existingApps = typeof admin.getApps === 'function' ? admin.getApps() : [];
  if (existingApps.length === 0) {
    admin.initializeApp(appConfig);
  }

  return getDatabase();
};

const db = initializeRealDatabase() || getMockDb();
const isRealFirebase = typeof admin.getApps === 'function' ? admin.getApps().length > 0 : Array.isArray(admin.apps) && admin.apps.length > 0;

module.exports = { db, firebaseAdmin: admin, isRealFirebase };
