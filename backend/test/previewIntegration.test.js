const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');

const start = async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
};

test('preview sem Firebase oferece catálogo, conteúdos e quizzes existentes', async () => {
  const { server, base } = await start();
  try {
    const email = `integracao.${Date.now()}@teste.com`;
    const signup = await fetch(`${base}/cadastro`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: 'Aluna Preview', email, senha: 'Senha@123' }) });
    assert.equal(signup.status, 201);
    const { token, usuario } = await signup.json();
    const cookie = signup.headers.get('set-cookie')?.split(';')[0] || '';
    assert.ok(token);
    const headers = { Authorization: `Bearer ${token}`, Cookie: cookie, Accept: 'application/json' };

    const subjects = await fetch(`${base}/api/materias`, { headers });
    assert.equal(subjects.status, 200);
    assert.equal((await subjects.json()).materias.length, 5);

    const contents = await fetch(`${base}/api/materias/biologia/conteudos`, { headers });
    assert.equal(contents.status, 200);
    assert.ok((await contents.json()).materia.topicos.length > 0);

    const quiz = await fetch(`${base}/api/quiz/biologia`, { headers });
    assert.equal(quiz.status, 200);
    const questions = (await quiz.json()).perguntas;
    assert.equal(questions.length, 3);
    const correct = questions[0].respostaCorreta;
    const answers = [
      { perguntaId: questions[0].id, resposta: String(correct) },
      { perguntaId: questions[1].id, resposta: 'wrong-answer' }
    ];
    const first = await fetch(`${base}/quiz/finalizar`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ materiaId: 'biologia', respostas: answers }) });
    assert.equal(first.status, 200);
    const firstResult = await first.json();
    assert.equal(firstResult.xpGanho, 5);
    assert.equal(firstResult.xpTotal, 5);

    const repeated = await fetch(`${base}/quiz/finalizar`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ materiaId: 'biologia', respostas: answers }) });
    const repeatedResult = await repeated.json();
    assert.equal(repeatedResult.xpGanho, 0);
    assert.equal(repeatedResult.xpTotal, 5);

    const mathQuiz = await fetch(`${base}/api/quiz/matematica`, { headers });
    const mathQuestions = (await mathQuiz.json()).perguntas;
    const mathCorrect = await fetch(`${base}/quiz/finalizar`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ materiaId: 'matematica', respostas: [{ perguntaId: mathQuestions[0].id, resposta: String(mathQuestions[0].respostaCorreta) }] }) });
    const mathResult = await mathCorrect.json();
    assert.equal(mathResult.xpGanho, 5);
    assert.equal(mathResult.xpTotal, 10);
    const profile = await fetch(`${base}/users/${usuario.id}`, { headers });
    assert.equal(profile.status, 200);
    assert.equal((await profile.json()).xp, 10);
    const home = await fetch(`${base}/home`, { headers: { Cookie: cookie, Accept: 'text/html' } });
    assert.equal(home.status, 200);
    assert.match(await home.text(), /10 XP/);

    const webStudy = await fetch(`${base}/materias/biologia`, { headers: { Authorization: `Bearer ${token}`, Accept: 'text/html' } });
    assert.equal(webStudy.status, 200);
    assert.match(await webStudy.text(), /Citologia/);
    const webQuizList = await fetch(`${base}/quiz`, { headers: { Authorization: `Bearer ${token}`, Accept: 'text/html' } });
    assert.equal(webQuizList.status, 200);
    assert.match(await webQuizList.text(), /quizzes/i);
    for (const subject of ['portugues', 'matematica', 'historia', 'geografia', 'biologia']) {
      const webQuizPage = await fetch(`${base}/quiz/${subject}`, { headers: { Authorization: `Bearer ${token}`, Cookie: cookie, Accept: 'text/html' } });
      assert.equal(webQuizPage.status, 200);
      assert.match(await webQuizPage.text(), new RegExp(`const USER_KEY = \"${usuario.id}\"`));
    }
    const favoritesPage = await fetch(`${base}/favoritos`, { headers: { Cookie: cookie, Accept: 'text/html' } });
    assert.equal(favoritesPage.status, 200);
    assert.match(await favoritesPage.text(), new RegExp(`const USER_KEY = \"${usuario.id}\"`));
  } finally { server.close(); }
});

test('Tutor IA é anunciado como novidade e a API ainda não está disponível', async () => {
  const { server, base } = await start();
  try {
    const email = `tutor.${Date.now()}@teste.com`;
    const signup = await fetch(`${base}/cadastro`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: 'Aluna Tutor', email, senha: 'Senha@123' }) });
    const { token } = await signup.json();
    const page = await fetch(`${base}/tutor-ia`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /EM BREVE/);
    const response = await fetch(`${base}/api/tutor`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ materia: 'Matemática', pergunta: 'O que é porcentagem?' }) });
    assert.equal(response.status, 404);
    assert.match((await response.json()).erro, /não encontrado/i);
  } finally { server.close(); }
});
