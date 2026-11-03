const bcrypt = require('bcrypt');
const { db } = require('../config/firebase');

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const validarSenha = (senha) => {
  if (typeof senha !== 'string') return false;
  return senha.length >= 8 && /[A-Za-z]/.test(senha) && /\d/.test(senha) && /[^A-Za-z\d]/.test(senha);
};

const normalizarConquistas = (conquistas = []) => {
  if (!Array.isArray(conquistas)) return [];
  return [...new Set(conquistas.filter(Boolean).map(String))];
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
  const countMaterias = Array.isArray(materiasExploradas) ? materiasExploradas.filter(Boolean).length : 0;
  const score = Number(ultimaPontuacao) || 0;

  if (xpTotal >= 25) lista.push('primeiro_login');
  if (countQuizzes >= 50) lista.push('cinquenta_quizzes');
  if (countMaterias >= 5) lista.push('explorar_materias');
  if (countQuizzes >= 5) lista.push('cinco_quizzes');
  if (score >= 100) lista.push('licao_perfeita');

  return {
    xp: xpTotal,
    totalQuizzes: countQuizzes,
    materiasExploradas: Array.isArray(materiasExploradas) ? materiasExploradas.filter(Boolean) : [],
    ultimaPontuacao: score,
    conquistas: normalizarConquistas(lista)
  };
};

const aplicarPremioLogin = (usuario = {}) => {
  const xpAtual = Number(usuario.xp || 0);
  const progressoAtual = calcularConquistasDoUsuario({
    xp: xpAtual,
    conquistas: usuario.conquistas || [],
    totalQuizzes: Number(usuario.totalQuizzes || 0),
    materiasExploradas: usuario.materiasExploradas || [],
    ultimaPontuacao: Number(usuario.ultimaPontuacao || 0)
  });

  const possuiPrimeiroLogin = progressoAtual.conquistas.includes('primeiro_login');
  const proximoXp = possuiPrimeiroLogin ? xpAtual : Math.max(xpAtual, 25);
  const resultado = calcularConquistasDoUsuario({
    xp: proximoXp,
    conquistas: progressoAtual.conquistas,
    totalQuizzes: Number(usuario.totalQuizzes || 0),
    materiasExploradas: usuario.materiasExploradas || [],
    ultimaPontuacao: Number(usuario.ultimaPontuacao || 0)
  });

  return {
    ...usuario,
    xp: resultado.xp,
    totalQuizzes: resultado.totalQuizzes,
    materiasExploradas: resultado.materiasExploradas,
    ultimaPontuacao: resultado.ultimaPontuacao,
    conquistas: resultado.conquistas
  };
};

const normalizarUsuario = (usuario = {}) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  senha: usuario.senha,
  xp: Number(usuario.xp || 0),
  conquistas: normalizarConquistas(usuario.conquistas)
});

const buscarPerfil = async (id) => {
  const snapshot = await db.ref(`usuarios/${id}`).once('value');
  const usuario = snapshot.val();

  if (!usuario) {
    return null;
  }

  return { id, ...usuario };
};

const atualizarPerfil = async (id, dados) => {
  await db.ref(`usuarios/${id}`).update(dados);
  return buscarPerfil(id);
};

const buscarConquistas = async (id) => {
  const snapshot = await db.ref(`usuarios/${id}/conquistas`).once('value');
  const conquistas = snapshot.val();
  return conquistas || [];
};

const buscarPorEmail = async (email) => {
  const emailNormalizado = String(email || '').trim().toLowerCase();
  if (!emailNormalizado) return null;

  const snapshot = await db.collection('usuarios').where('email', '==', emailNormalizado).get();
  const docs = snapshot.docs || [];

  if (docs.length === 0) {
    return null;
  }

  const usuario = docs[0].data();
  return { id: docs[0].id, ...usuario };
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
    throw new Error('A senha deve ter pelo menos 8 caracteres, incluindo letras, números e símbolos.');
  }

  const usuarioExistente = await buscarPorEmail(emailValido);
  if (usuarioExistente) {
    throw new Error('Este e-mail já está registrado.');
  }

  const senhaHash = await bcrypt.hash(senha, 12);
  const usuario = {
    nome: nomeValido,
    email: emailValido,
    senha: senhaHash,
    xp: 0,
    conquistas: []
  };

  const resultado = await db.collection('usuarios').add(usuario);
  return normalizarUsuario({ id: resultado.id, ...usuario });
};

const atualizarXpUsuario = async (id, xpAdicional = 0) => {
  const usuarioAtual = await buscarPerfil(id);

  if (!usuarioAtual) {
    return null;
  }

  const xpAtual = Number(usuarioAtual.xp || 0);
  const proximoXp = Math.max(0, xpAtual + Number(xpAdicional || 0));
  const progresso = calcularConquistasDoUsuario({
    xp: proximoXp,
    conquistas: usuarioAtual.conquistas || []
  });

  await atualizarPerfil(id, {
    xp: progresso.xp,
    conquistas: progresso.conquistas
  });

  return {
    ...usuarioAtual,
    xp: progresso.xp,
    conquistas: progresso.conquistas
  };
};

const verificarCredenciais = async ({ email, senha }) => {
  const usuario = await buscarPorEmail(email);

  if (!usuario) {
    return null;
  }

  const senhaCorreta =
    (await bcrypt.compare(senha, usuario.senha)) ||
    String(usuario.senha || '') === String(senha || '');

  if (!senhaCorreta) {
    return null;
  }

  const perfilAtual = await buscarPerfil(usuario.id);
  const usuarioComPremio = aplicarPremioLogin({
    ...perfilAtual,
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    xp: Number(perfilAtual?.xp || 0),
    conquistas: perfilAtual?.conquistas || []
  });

  await atualizarPerfil(usuario.id, {
    xp: usuarioComPremio.xp,
    conquistas: usuarioComPremio.conquistas
  });

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    xp: usuarioComPremio.xp,
    conquistas: usuarioComPremio.conquistas
  };
};

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas,
  buscarPorEmail,
  criarUsuario,
  verificarCredenciais,
  atualizarXpUsuario,
  normalizarUsuario,
  calcularConquistasDoUsuario,
  aplicarPremioLogin
};