const { db } = require('../config/firebase');

const listarMaterias = async () => {
  const snapshot = await db.ref('materias').once('value');
  const materias = snapshot.val() || {};

  return Object.entries(materias).map(([id, value]) => ({ id, ...value }));
};

const buscarMateria = async (id) => {
  const snapshot = await db.ref(`materias/${id}`).once('value');
  const materia = snapshot.val();

  if (!materia) {
    return null;
  }

  return { id, ...materia };
};

module.exports = {
  listarMaterias,
  buscarMateria
};