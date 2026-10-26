const bcrypt = require('bcrypt');
const { db } = require('../config/firebase');

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

const validarSenha = (senha) => {
  if (typeof senha !== 'string') return false;
  return senha.length >= 8 && /[A-Za-z]/.test(senha) && /\d/.test(senha) && /[^A-Za-z\d]/.test(senha);
};

const normalizarUsuario = (usuario) => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  senha: usuario.senha,
  conquistas: usuario.conquistas || []
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
    conquistas: []
  };

  const resultado = await db.collection('usuarios').add(usuario);
  return normalizarUsuario({ id: resultado.id, ...usuario });
};

const verificarCredenciais = async ({ email, senha }) => {
  const usuario = await buscarPorEmail(email);

  if (!usuario) {
    return null;
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    return null;
  }

  return { id: usuario.id, nome: usuario.nome, email: usuario.email, conquistas: usuario.conquistas || [] };
};

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas,
  buscarPorEmail,
  criarUsuario,
  verificarCredenciais
};