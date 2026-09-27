const { db } = require('../config/firebase');

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

module.exports = {
  buscarPerfil,
  atualizarPerfil,
  buscarConquistas
};