
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { db, isRealFirebase } = require('../config/firebase');

// Fallback em memória para preview sem credenciais. A persistência no navegador/app
// continua sendo responsabilidade do LocalStorage/AsyncStorage até a sincronização.
const progressoLocal = new Map();
const localPreviewFile = path.join(__dirname, '../../.local-preview-users.json');
const lerUsuariosLocais = () => { try { return JSON.parse(fs.readFileSync(localPreviewFile, 'utf8')); } catch { return {}; } };
let usuariosLocais = lerUsuariosLocais();
const salvarUsuariosLocais = () => { try { fs.writeFileSync(localPreviewFile, JSON.stringify(usuariosLocais, null, 2), { mode: 0o600 }); } catch (error) { console.warn('Não foi possível salvar o perfil local do preview:', error.message); } };
const { aplicarPontuacao } = require('../services/xpService');

const validarEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || '').trim()
  );

const validarSenha = (senha) => {
  if (typeof senha !== 'string') return false;

  return (
    senha.length >= 8 &&
    /[A-Za-z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z\d]/.test(senha)
  );
};

const normalizarConquistas = (conquistas = []) => {
  if (Array.isArray(conquistas)) {
    return [...new Set(
      conquistas
        .filter(Boolean)
        .map((item) => String(item).trim())
        .filter(Boolean)
    )];
  }

  if (conquistas && typeof conquistas === 'object') {
    return Object.entries(conquistas)
      .filter(([, valor]) =>
        valor === true || valor?.concluida === true
      )
      .map(([id]) => id);
  }

  return [];
};

const normalizarMateriasExploradas = (materias = []) => {
  if (!Array.isArray(materias)) return [];

  return [...new Set(
    materias.filter(Boolean).map(String)
  )];
};

const calcularConquistasDoUsuario = ({
  xp = 0,
  conquistas = [],
  totalQuizzes = 0,
  materiasExploradas = [],
  ultimaPontuacao = 0
} = {}) => {
  const xpTotal = Number(xp) || 0;
  const lista = normalizarConquistas(conquistas);
  const countQuizzes = Number(totalQuizzes) || 0;
  const materias = normalizarMateriasExploradas(
    materiasExploradas
  );
  const score = Number(ultimaPontuacao) || 0;

  if (xpTotal >= 25) lista.push('primeiro_login');
  if (countQuizzes >= 50) lista.push('cinquenta_quizzes');
  if (materias.length >= 5) lista.push('explorar_materias');
  if (countQuizzes >= 5) lista.push('cinco_quizzes');
  if (score >= 100) lista.push('licao_perfeita');

  return {
    xp: xpTotal,
    totalQuizzes: countQuizzes,
    materiasExploradas: materias,
    ultimaPontuacao: score,
    conquistas: normalizarConquistas(lista)
  };
};

const normalizarUsuario = (usuario = {}) => ({
  ...usuario,
  id: usuario.id,
  nome: usuario.nome || usuario.perfil?.nome || 'Usuário',
  email: usuario.email || '',
  xp: Number(usuario.xp ?? usuario.perfil?.xpTotal ?? 0),
  totalQuizzes: Number(usuario.totalQuizzes || 0),
  materiasExploradas: normalizarMateriasExploradas(
    usuario.materiasExploradas
  ),
  ultimaPontuacao: Number(usuario.ultimaPontuacao || 0),
  conquistas: normalizarConquistas(usuario.conquistas),
  perfil: {
    ...(usuario.perfil || {}),
    nome: usuario.perfil?.nome || usuario.nome || 'Usuário',
    xpTotal: Number(
      usuario.perfil?.xpTotal ?? usuario.xp ?? 0
    ),
    nivelAtual: usuario.perfil?.nivelAtual || 'Iniciante'
  },
  mascote: usuario.mascote || {
    roupa: 'casaco_roto',
    acessorio: 'fone_ouvido',
    expressao: 'piscada',
    efeito: 'galaxia',
    cor: 'roxo'
  },
  favoritos: usuario.favoritos || {}
});

const buscarPerfil = async (id) => {
  if (!id) return null;
  if (!isRealFirebase) {
    const local = usuariosLocais[String(id)] || progressoLocal.get(String(id));
    return local ? normalizarUsuario({ id, ...local }) : null;
  }

  const snapshot = await db.ref(`usuarios/${id}`).once('value');
  const usuario = snapshot.val();

  if (!usuario) return null;

  return normalizarUsuario({ id, ...usuario });
};

const atualizarPerfil = async (id, dados = {}) => {
  if (!id || !dados || typeof dados !== 'object') {
    throw new Error('Usuário ou dados inválidos.');
  }

  const usuarioAtual = await buscarPerfil(id);

  if (!usuarioAtual) return null;

  const atualizacao = { ...dados };

  if (dados.nome !== undefined || dados.xp !== undefined) {
    atualizacao.perfil = {
      ...usuarioAtual.perfil,
      ...(dados.perfil || {}),
      ...(dados.nome !== undefined
        ? { nome: dados.nome }
        : {}),
      ...(dados.xp !== undefined
        ? { xpTotal: Number(dados.xp) }
        : {})
    };
  }

  if (dados.conquistas !== undefined) {
    atualizacao.conquistas = normalizarConquistas(
      dados.conquistas
    );
  }

  if (!isRealFirebase) {
    usuariosLocais[String(id)] = { ...usuarioAtual, ...atualizacao };
    salvarUsuariosLocais();
    return buscarPerfil(id);
  }
  await db.ref(`usuarios/${id}`).update(atualizacao);
  return buscarPerfil(id);
};

const buscarConquistas = async (id) => {
  if (!isRealFirebase) return (await buscarPerfil(id))?.conquistas || [];
  const snapshot = await db
    .ref(`usuarios/${id}/conquistas`)
    .once('value');

  return normalizarConquistas(snapshot.val());
};

const listarUsuarios = async () => {
  if (!isRealFirebase) return Object.entries(usuariosLocais).map(([id, usuario]) => normalizarUsuario({ id, ...usuario }));
  const snapshot = await db.ref('usuarios').once('value');
  const usuarios = snapshot.val() || {};

  return Object.entries(usuarios).map(([id, usuario]) =>
    normalizarUsuario({ id, ...usuario })
  );
};

const buscarPorEmail = async (email) => {
  const emailNormalizado = String(email || '')
    .trim()
    .toLowerCase();

  if (!emailNormalizado) return null;

  const usuarios = await listarUsuarios();

  return usuarios.find(
    (usuario) =>
      String(usuario.email || '').trim().toLowerCase() ===
      emailNormalizado
  ) || null;
};

const criarUsuario = async ({ nome, email, senha }) => {
  const nomeValido = String(nome || '').trim();
  const emailValido = String(email || '').trim().toLowerCase();

  if (!nomeValido) {
    throw new Error('O nome completo é obrigatório.');
  }

  if (!validarEmail(emailValido)) {
    throw new Error('Informe um e-mail válido.');
  }

  if (!validarSenha(senha)) {
    throw new Error(
      'A senha deve ter pelo menos 8 caracteres, incluindo letras, números e símbolos.'
    );
  }

  const usuarioExistente = await buscarPorEmail(emailValido);

  if (usuarioExistente) {
    throw new Error('Este e-mail já está registrado.');
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  if (!isRealFirebase) {
    const id = `preview-${crypto.randomUUID()}`;
    const usuario = { nome: nomeValido, email: emailValido, senha: senhaHash, xp: 0, totalQuizzes: 0, materiasExploradas: [], ultimaPontuacao: 0, conquistas: [], questoesPontuadas: {}, quizzesConcluidos: {}, perfil: { nome: nomeValido, tag: `usuario_${id.slice(-6)}`, nivelAtual: 'Iniciante', xpTotal: 0 }, favoritos: {}, progressoConquistas: {} };
    usuariosLocais[id] = usuario; salvarUsuariosLocais();
    return normalizarUsuario({ id, ...usuario });
  }

  const ref = db.ref('usuarios').push();
  const id = ref.key;

  const usuario = {
    nome: nomeValido,
    email: emailValido,
    senha: senhaHash,

    xp: 0,
    totalQuizzes: 0,
    materiasExploradas: [],
    ultimaPontuacao: 0,
    conquistas: [],
    questoesPontuadas: {},

    perfil: {
      nome: nomeValido,
      tag: `usuario_${id.slice(-6)}`,
      nivelAtual: 'Iniciante',
      xpTotal: 0
    },

    mascote: {
      roupa: 'casaco_roto',
      acessorio: 'fone_ouvido',
      expressao: 'piscada',
      efeito: 'galaxia',
      cor: 'roxo'
    },

    favoritos: {},
    progressoConquistas: {}
  };

  await ref.set(usuario);

  return normalizarUsuario({ id, ...usuario });
};

const atualizarXpUsuario = async (
  id,
  xpAdicional = 0,
  progressoExtra = {}
) => {
  const usuarioAtual = await buscarPerfil(id);

  if (!usuarioAtual) return null;

  const xpAtual = Number(usuarioAtual.xp || 0);
  const proximoXp = Math.max(
    0,
    xpAtual + Number(xpAdicional || 0)
  );

  const progresso = calcularConquistasDoUsuario({
    xp: proximoXp,
    conquistas: usuarioAtual.conquistas,
    totalQuizzes:
      progressoExtra.totalQuizzes ??
      usuarioAtual.totalQuizzes,
    materiasExploradas:
      progressoExtra.materiasExploradas ??
      usuarioAtual.materiasExploradas,
    ultimaPontuacao:
      progressoExtra.ultimaPontuacao ??
      usuarioAtual.ultimaPontuacao
  });

  const nivelAtual =
    proximoXp >= 3000 ? 'Lenda' :
    proximoXp >= 1500 ? 'Mestre' :
    proximoXp >= 1000 ? 'Sábio' :
    proximoXp >= 500 ? 'Aventureiro' :
    'Iniciante';

  await atualizarPerfil(id, {
    xp: progresso.xp,
    totalQuizzes: progresso.totalQuizzes,
    materiasExploradas: progresso.materiasExploradas,
    ultimaPontuacao: progresso.ultimaPontuacao,
    conquistas: progresso.conquistas,
    perfil: {
      ...usuarioAtual.perfil,
      xpTotal: progresso.xp,
      nivelAtual
    }
  });

  return buscarPerfil(id);
};

// Registra 5 XP por pergunta correta, uma única vez
// por usuário e por matéria, diretamente no Firebase.
const registrarXpPorPerguntas = async (
  id,
  materiaId,
  questoesCorretas = [],
  progressoExtra = {}
) => {
  if (!id || !materiaId || !Array.isArray(questoesCorretas)) {
    throw new Error('Dados inválidos para registrar XP.');
  }

  const novasQuestoes = [...new Set(questoesCorretas.filter(Boolean).map(String))];
  const quizKey = String(progressoExtra.quizKey || `${materiaId}:${novasQuestoes.slice().sort().join(',')}`);

  if (!isRealFirebase) {
    const atual = usuariosLocais[String(id)] || progressoLocal.get(String(id)) || {
      id, nome: 'Estudante', email: '', xp: 0, totalQuizzes: 0,
      materiasExploradas: [], conquistas: [], questoesPontuadas: {},
      quizzesConcluidos: {}, perfil: { xpTotal: 0, nivelAtual: 'Iniciante' }
    };
    const aplicado = aplicarPontuacao(atual, materiaId, novasQuestoes, quizKey, progressoExtra.ultimaPontuacao);
    const usuario = normalizarUsuario({ ...aplicado.usuario, id });
    progressoLocal.set(String(id), usuario);
    if (usuariosLocais[String(id)]) { usuariosLocais[String(id)] = usuario; salvarUsuariosLocais(); }
    return { xpGanho: aplicado.xpGanho, usuario, sincronizado: false };
  }

  const ref = db.ref(`usuarios/${id}`);
  let xpGanho = 0;
  const transacao = await ref.transaction((usuario) => {
    if (!usuario) return;
    const aplicado = aplicarPontuacao(usuario, materiaId, novasQuestoes, quizKey, progressoExtra.ultimaPontuacao);
    xpGanho = aplicado.xpGanho;
    return aplicado.usuario;
  });
  if (!transacao.committed) throw new Error('Não foi possível registrar o XP.');
  const usuarioAtualizado = normalizarUsuario({ id, ...transacao.snapshot.val() });
  return { xpGanho, usuario: usuarioAtualizado, sincronizado: true };
};

const verificarCredenciais = async ({ email, senha }) => {
  const usuario = await buscarPorEmail(email);

  if (!usuario || !usuario.senha) return null;

  const senhaCorreta = await bcrypt.compare(
    String(senha || ''),
    usuario.senha
  );

  if (!senhaCorreta) return null;

  const atualizado = aplicarPremioLogin(usuario);

  await atualizarPerfil(usuario.id, {
    xp: atualizado.xp,
    totalQuizzes: atualizado.totalQuizzes,
    materiasExploradas: atualizado.materiasExploradas,
    ultimaPontuacao: atualizado.ultimaPontuacao,
    conquistas: atualizado.conquistas
  });

  return buscarPerfil(usuario.id);
};

const aplicarPremioLogin = (usuario = {}) => {
  return {
    ...usuario,
    ...calcularConquistasDoUsuario(usuario)
  };
};

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas,
  buscarPorEmail,
  listarUsuarios,
  criarUsuario,
  verificarCredenciais,
  atualizarXpUsuario,
  registrarXpPorPerguntas,
  normalizarUsuario,
  calcularConquistasDoUsuario,
  aplicarPremioLogin
};
