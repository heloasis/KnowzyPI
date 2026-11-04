const test = require('node:test');
const assert = require('node:assert/strict');

const userModel = require('../src/models/user');

test('criarUsuario inicia com 0 XP e sem conquistas desbloqueadas', async () => {
  const email = `novo.${Date.now()}@teste.com`;

  const usuario = await userModel.criarUsuario({
    nome: 'Novo Usuário',
    email,
    senha: 'Senha@123'
  });

  assert.equal(usuario.xp, 0);
  assert.deepEqual(usuario.conquistas, []);
});

test('verificarCredenciais não concede XP ou conquista automaticamente no primeiro login', async () => {
  const usuario = await userModel.verificarCredenciais({
    email: 'aluno@teste.com',
    senha: '123456'
  });

  assert.equal(usuario.xp, 0);
  assert.deepEqual(usuario.conquistas, []);
});

test('calcularConquistasDoUsuario desbloqueia apenas quando o critério real é alcançado', () => {
  const semProgresso = userModel.calcularConquistasDoUsuario({ xp: 0, conquistas: [], totalQuizzes: 0, materiasExploradas: [], ultimaPontuacao: 0 });
  const comProgresso = userModel.calcularConquistasDoUsuario({
    xp: 25,
    conquistas: [],
    totalQuizzes: 5,
    materiasExploradas: ['matematica', 'portugues', 'historia', 'geografia', 'biologia'],
    ultimaPontuacao: 100
  });

  assert.deepEqual(semProgresso.conquistas, []);
  assert.ok(comProgresso.conquistas.includes('primeiro_login'));
  assert.ok(comProgresso.conquistas.includes('cinco_quizzes'));
  assert.ok(comProgresso.conquistas.includes('explorar_materias'));
  assert.ok(comProgresso.conquistas.includes('licao_perfeita'));
});
