const { db } = require('../config/firebase');
const { normalizeUtf8Value } = require('../utils/utf8');
const conteudos = require('../data/conteudosEstudo.json');

const materiasBase = [
  ['matematica', 'Matemática', 'Números, relações e raciocínio lógico'],
  ['portugues', 'Português', 'Língua, comunicação e literatura'],
  ['historia', 'História', 'Sociedades, transformações e temporalidades'],
  ['geografia', 'Geografia', 'Espaço geográfico, ambiente e sociedade'],
  ['biologia', 'Biologia', 'Vida, organismos e relações ecológicas']
];

const listarMaterias = async () => {
  try {
    const snapshot = await db.ref('materias').once('value');
    const materias = snapshot.val() || {};
    const existentes = Object.entries(materias).map(([id, value]) => ({
      id, slug: String(id || value?.nome || '').toLowerCase(), ...value
    }));
    if (existentes.length) return normalizeUtf8Value(existentes);
  } catch (error) {
    console.warn('[Matérias] Usando catálogo local:', error.message);
  }
  return materiasBase.map(([id, nome, descricao]) => ({ id, slug: id, nome, descricao }));
};

const buscarMateria = async (id) => {
  try {
    const snapshot = await db.ref(`materias/${id}`).once('value');
    const materia = snapshot.val();
    if (materia) return normalizeUtf8Value({ id, ...materia });
  } catch (error) {
    console.warn('[Matérias] Firebase indisponível ao buscar:', error.message);
  }
  const local = materiasBase.find(([slug]) => slug === String(id).toLowerCase());
  return local ? { id: local[0], slug: local[0], nome: local[1], descricao: local[2] } : null;
};

const listarConteudos = (materiaId) => {
  const item = conteudos[String(materiaId || '').toLowerCase()];
  if (!item) return null;
  return { id: materiaId, nome: item.nome, descricao: item.descricao, topicos: item.topicos.map(([id, titulo, explicacao, exemplo]) => ({ id, titulo, explicacao, exemplo })) };
};

module.exports = { listarMaterias, buscarMateria, listarConteudos };
