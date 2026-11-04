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

test('buscarPerfil remove conquistas legadas e mantém apenas os IDs válidos do sistema', async () => {
  const perfil = await userModel.buscarPerfil('u1');

  assert.deepEqual(perfil.conquistas, []);
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

test('atualizarXpUsuario incrementa o progresso do quiz mesmo sem contador explícito', async () => {
  const user = await userModel.criarUsuario({
    nome: 'Aluno Teste',
    email: `quiz.${Date.now()}@teste.com`,
    senha: 'Senha@123'
  });

  const atualizado = await userModel.atualizarXpUsuario(user.id, 20, {
    materiasExploradas: ['matematica']
  });

  assert.equal(atualizado.totalQuizzes, 1);
  assert.deepEqual(atualizado.materiasExploradas, ['matematica']);
  assert.equal(atualizado.xp, 20);
});
