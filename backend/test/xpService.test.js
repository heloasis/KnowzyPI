const test = require('node:test');
const assert = require('node:assert/strict');
const { aplicarPontuacao } = require('../src/services/xpService');

test('questão correta concede exatamente 5 XP', () => {
  const result = aplicarPontuacao({ id: 'u1', xp: 0 }, 'portugues', ['p1'], 'portugues:p1');
  assert.equal(result.xpGanho, 5);
  assert.equal(result.usuario.xp, 5);
});

test('questão incorreta não concede XP', () => {
  const result = aplicarPontuacao({ id: 'u1', xp: 10 }, 'portugues', [], 'portugues:p1');
  assert.equal(result.xpGanho, 0);
  assert.equal(result.usuario.xp, 10);
});

test('reenvio da mesma questão e finalização não duplica XP nem quiz concluído', () => {
  const first = aplicarPontuacao({ id: 'u1', xp: 0 }, 'portugues', ['p1'], 'quiz-portugues');
  const second = aplicarPontuacao(first.usuario, 'portugues', ['p1'], 'quiz-portugues');
  assert.equal(first.xpGanho, 5);
  assert.equal(second.xpGanho, 0);
  assert.equal(second.usuario.xp, 5);
  assert.equal(second.usuario.totalQuizzes, 1);
});

test('XP é unificado entre matérias e IDs repetidos em matérias diferentes', () => {
  const a = aplicarPontuacao({ id: 'u1', xp: 0 }, 'portugues', ['q1'], 'quiz-portugues');
  const b = aplicarPontuacao(a.usuario, 'matematica', ['q1'], 'quiz-matematica');
  const c = aplicarPontuacao(b.usuario, 'historia', ['h1'], 'quiz-historia');
  assert.equal(c.usuario.xp, 15);
  assert.equal(c.usuario.totalQuizzes, 3);
});

test('várias questões corretas concedem 5 XP por questão, sem duplicar IDs no mesmo envio', () => {
  const result = aplicarPontuacao({ id: 'u1', xp: 0 }, 'biologia', ['a', 'b', 'a', 'c'], 'quiz-bio');
  assert.equal(result.xpGanho, 15);
});

test('o objeto atualizado mantém dados para recarga/sincronização', () => {
  const first = aplicarPontuacao({ id: 'u1', xp: 20 }, 'geografia', ['g1'], 'quiz-geo');
  const reloaded = JSON.parse(JSON.stringify(first.usuario));
  const again = aplicarPontuacao(reloaded, 'geografia', ['g1'], 'quiz-geo');
  assert.equal(again.usuario.xp, 25);
  assert.equal(again.xpGanho, 0);
  assert.equal(again.usuario.conquistas.includes('primeiro_login'), true);
});
