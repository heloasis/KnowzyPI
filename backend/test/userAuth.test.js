const test = require('node:test');
const assert = require('node:assert/strict');

const userModel = require('../src/models/user');

test('userModel.criarUsuario armazena usuário com senha criptografada e email único', async () => {
  const email = 'novo.usuario@teste.com';

  const usuario = await userModel.criarUsuario({
    nome: 'Novo Usuário',
    email,
    senha: 'Senha@123'
  });

  assert.equal(usuario.nome, 'Novo Usuário');
  assert.equal(usuario.email, email);
  assert.notEqual(usuario.senha, 'Senha@123');
  assert.match(usuario.senha, /^\$2[aby]\$/);

  await assert.rejects(
    () => userModel.criarUsuario({
      nome: 'Outro Usuário',
      email,
      senha: 'Senha@456'
    }),
    /já está registrado|email/i
  );
});

test('userModel.verificarCredenciais aceita o usuário padrão em memória', async () => {
  const usuario = await userModel.verificarCredenciais({
    email: 'aluno@teste.com',
    senha: '123456'
  });

  assert.ok(usuario);
  assert.equal(usuario.email, 'aluno@teste.com');
  assert.equal(usuario.nome, 'Aluno Teste');
});

test('userModel.criarUsuario rejeita dados inválidos', async () => {
  await assert.rejects(
    () => userModel.criarUsuario({
      nome: '',
      email: 'email-invalido',
      senha: '123'
    }),
    /nome|e-mail|senha/i
  );
});
