const bcrypt = require('bcrypt');
const { db } = require('../config/firebase');

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const validarSenha = (senha) => {
  if (typeof senha !== 'string') return false;
  return senha.length >= 8 && /[A-Za-z]/.test(senha) && /\d/.test(senha) && /[^A-Za-z\d]/.test(senha);
};

const ACHIEVEMENT_IDS = new Set([
  'primeiro_login',
  'cinquenta_quizzes',
  'explorar_materias',
  'cinco_quizzes',
  'licao_perfeita'
]);

const normalizarConquistas = (conquistas = []) => {
  if (!Array.isArray(conquistas)) return [];
  return [...new Set(
    conquistas
      .filter(Boolean)
      .map(String)
      .map((conquista) => conquista.trim())
      .filter((conquista) => ACHIEVEMENT_IDS.has(conquista))
  )];
};

const normalizarMateriasExploradas = (materiasExploradas = []) => {
  if (!Array.isArray(materiasExploradas)) return [];
  return [...new Set(materiasExploradas.filter(Boolean).map(String))];
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
  const materias = normalizarMateriasExploradas(materiasExploradas);
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

const aplicarPremioLogin = (usuario = {}) => {
  const dados = {
    ...usuario,
    xp: Number(usuario.xp || 0),
    totalQuizzes: Number(usuario.totalQuizzes || 0),
    materiasExploradas: normalizarMateriasExploradas(usuario.materiasExploradas),
    ultimaPontuacao: Number(usuario.ultimaPontuacao || 0),
    conquistas: normalizarConquistas(usuario.conquistas)
  };

  return {
    ...dados,
    ...calcularConquistasDoUsuario(dados)
  };
};

const normalizarUsuario = (usuario = {}) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  senha: usuario.senha,
  xp: Number(usuario.xp || 0),
  totalQuizzes: Number(usuario.totalQuizzes || 0),
  materiasExploradas: normalizarMateriasExploradas(usuario.materiasExploradas),
  ultimaPontuacao: Number(usuario.ultimaPontuacao || 0),
  conquistas: normalizarConquistas(usuario.conquistas)
});

const buscarPerfil = async (id) => {
  const snapshot = await db.ref(`usuarios/${id}`).once('value');
  const usuario = snapshot.val();

  if (!usuario) {
    return null;
  }

  return normalizarUsuario({ id, ...usuario });
};

const atualizarPerfil = async (id, dados) => {
  await db.ref(`usuarios/${id}`).update(dados);
  return buscarPerfil(id);
};

const buscarConquistas = async (id) => {
  const snapshot = await db.ref(`usuarios/${id}/conquistas`).once('value');
  const conquistas = snapshot.val();
  return normalizarConquistas(conquistas || []);
};

const listarUsuarios = async () => {
  const snapshot = await db.ref('usuarios').once('value');
  const usuarios = snapshot.val() || {};
  return Object.entries(usuarios).map(([id, usuario]) => ({ id, ...usuario }));
};

const buscarPorEmail = async (email) => {
  const emailNormalizado = String(email || '').trim().toLowerCase();
  if (!emailNormalizado) return null;

  const usuarios = await listarUsuarios();
  const usuario = usuarios.find((item) => String(item.email || '').trim().toLowerCase() === emailNormalizado);

  if (!usuario) {
    return null;
  }

  return normalizarUsuario(usuario);
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
    totalQuizzes: 0,
    materiasExploradas: [],
    ultimaPontuacao: 0,
    conquistas: []
  };

  const ref = db.ref('usuarios').push();
  const id = ref.key;
  await ref.set(usuario);
  return normalizarUsuario({ id, ...usuario });
};

const atualizarXpUsuario = async (id, xpAdicional = 0, progressoExtra = {}) => {
  const usuarioAtual = await buscarPerfil(id);

  if (!usuarioAtual) {
    return null;
  }

  const xpAtual = Number(usuarioAtual.xp || 0);
  const totalQuizzes = Number(progressoExtra.totalQuizzes ?? usuarioAtual.totalQuizzes ?? 0);
  const materiasExploradas = normalizarMateriasExploradas(
    progressoExtra.materiasExploradas ?? usuarioAtual.materiasExploradas ?? []
  );
  const ultimaPontuacao = Number(progressoExtra.ultimaPontuacao ?? usuarioAtual.ultimaPontuacao ?? 0);
  const proximoXp = Math.max(0, xpAtual + Number(xpAdicional || 0));
  const progresso = calcularConquistasDoUsuario({
    xp: proximoXp,
    conquistas: usuarioAtual.conquistas || [],
    totalQuizzes,
    materiasExploradas,
    ultimaPontuacao
  });

  await atualizarPerfil(id, {
    xp: progresso.xp,
    totalQuizzes: progresso.totalQuizzes,
    materiasExploradas: progresso.materiasExploradas,
    ultimaPontuacao: progresso.ultimaPontuacao,
    conquistas: progresso.conquistas
  });

  return {
    ...usuarioAtual,
    xp: progresso.xp,
    totalQuizzes: progresso.totalQuizzes,
    materiasExploradas: progresso.materiasExploradas,
    ultimaPontuacao: progresso.ultimaPontuacao,
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
  const perfilNormalizado = {
    ...perfilAtual,
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    xp: Number(perfilAtual?.xp || 0),
    totalQuizzes: Number(perfilAtual?.totalQuizzes || 0),
    materiasExploradas: normalizarMateriasExploradas(perfilAtual?.materiasExploradas),
    ultimaPontuacao: Number(perfilAtual?.ultimaPontuacao || 0),
    conquistas: normalizarConquistas(perfilAtual?.conquistas)
  };

  const usuarioComProgresso = {
    ...perfilNormalizado,
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    xp: Number(perfilNormalizado.xp || 0),
    totalQuizzes: Number(perfilNormalizado.totalQuizzes || 0),
    materiasExploradas: normalizarMateriasExploradas(perfilNormalizado.materiasExploradas),
    ultimaPontuacao: Number(perfilNormalizado.ultimaPontuacao || 0),
    conquistas: normalizarConquistas(perfilNormalizado.conquistas)
  };

  await atualizarPerfil(usuario.id, {
    xp: usuarioComProgresso.xp,
    totalQuizzes: usuarioComProgresso.totalQuizzes,
    materiasExploradas: usuarioComProgresso.materiasExploradas,
    ultimaPontuacao: usuarioComProgresso.ultimaPontuacao,
    conquistas: usuarioComProgresso.conquistas
  });

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    xp: usuarioComProgresso.xp,
    totalQuizzes: usuarioComProgresso.totalQuizzes,
    materiasExploradas: usuarioComProgresso.materiasExploradas,
    ultimaPontuacao: usuarioComProgresso.ultimaPontuacao,
    conquistas: usuarioComProgresso.conquistas
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