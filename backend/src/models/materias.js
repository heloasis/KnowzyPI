const { db } = require('../config/firebase');
const { normalizeUtf8Value } = require('../utils/utf8');

const listarMaterias = async () => {
  const snapshot = await db.ref('materias').once('value');
  const materias = snapshot.val() || {};

  return normalizeUtf8Value(Object.entries(materias).map(([id, value]) => ({
    id,
    slug: String(id || value?.nome || '').toLowerCase(),
    ...value
  })));
};

const buscarMateria = async (id) => {
  const snapshot = await db.ref(`materias/${id}`).once('value');
  const materia = snapshot.val();

  if (!materia) {
    return null;
  }

  return normalizeUtf8Value({ id, ...materia });
};

module.exports = {
  listarMaterias,
  buscarMateria
};