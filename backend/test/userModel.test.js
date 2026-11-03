const test = require('node:test');
const assert = require('node:assert/strict');

const { aplicarPremioLogin, calcularConquistasDoUsuario } = require('../src/models/user');

test('aplicarPremioLogin concede a primeira conquista e 50 XP ao entrar pela primeira vez', () => {
  const resultado = aplicarPremioLogin({ xp: 0, conquistas: [] });

  assert.equal(resultado.xp, 50);
  assert.ok(resultado.conquistas.includes('primeiro_passo'));
});

test('calcularConquistasDoUsuario desbloqueia o nível de acordo com o XP do usuário', () => {
  const resultado = calcularConquistasDoUsuario({ xp: 750, conquistas: [] });

  assert.ok(resultado.conquistas.includes('primeiro_passo'));
  assert.ok(resultado.conquistas.includes('estudante'));
});
