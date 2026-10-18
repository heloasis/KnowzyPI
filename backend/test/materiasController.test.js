const test = require('node:test');
const assert = require('node:assert/strict');

const materiaModel = require('../src/models/materias');
const { listarMaterias } = require('../src/controllers/materiasController');

test('materiaModel.listarMaterias lê a lista do banco em memória', async () => {
  const materias = await materiaModel.listarMaterias();

  assert.ok(Array.isArray(materias));
  assert.ok(materias.some((materia) => materia.nome === 'Matemática'));
  assert.ok(materias.some((materia) => materia.nome === 'Português'));
});

test('listarMaterias renderiza a view de matérias', async () => {
  const listaOriginal = materiaModel.listarMaterias;
  materiaModel.listarMaterias = async () => [
    { id: 'mat1', nome: 'Matemática' },
    { id: 'por1', nome: 'Português' }
  ];

  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    render(view, data) {
      this.view = view;
      this.data = data;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  await listarMaterias({}, res);

  assert.equal(res.view, 'materias');
  assert.deepEqual(res.data.materias, [
    { id: 'mat1', nome: 'Matemática' },
    { id: 'por1', nome: 'Português' }
  ]);

  materiaModel.listarMaterias = listaOriginal;
});
