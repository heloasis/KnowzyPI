const test = require('node:test');
const assert = require('node:assert/strict');

const materiaModel = require('../src/models/materias');
const { listarMaterias, listarMateriasApi } = require('../src/controllers/materiasController');

test('materiaModel.listarMaterias lê a lista completa das matérias do app', async () => {
  const materias = await materiaModel.listarMaterias();

  assert.ok(Array.isArray(materias));
  assert.deepEqual(
    materias.map((materia) => materia.slug),
    ['matematica', 'portugues', 'historia', 'geografia', 'biologia']
  );
  assert.deepEqual(
    materias.map((materia) => materia.nome),
    ['Matemática', 'Português', 'História', 'Geografia', 'Biologia']
  );
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

test('listarMateriasApi retorna JSON para o app mobile', async () => {
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
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  await listarMateriasApi({}, res);

  assert.equal(res.code, 200);
  assert.deepEqual(res.payload, {
    materias: [
      { id: 'mat1', nome: 'Matemática' },
      { id: 'por1', nome: 'Português' }
    ]
  });

  materiaModel.listarMaterias = listaOriginal;
});
