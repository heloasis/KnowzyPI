const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../server');

async function startServer() {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function login(baseUrl, email = 'aluno@teste.com', senha = '123456') {
  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
    redirect: 'manual'
  });

  const setCookie = response.headers.get('set-cookie');
  return setCookie ? setCookie.split(';')[0] : '';
}

async function requestWithCookie(baseUrl, path, cookieHeader, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    redirect: 'manual',
    headers: {
      ...(options.headers || {}),
      Cookie: cookieHeader
    }
  });
}

test('página de login renderiza com valor padrão seguro quando não há redirect', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/login`, { redirect: 'manual', headers: { Accept: 'text/html' } });

    assert.equal(response.status, 200);
    const body = await response.text();
    assert.match(body, /defaultRedirectTo.*\/home/i);
  } finally {
    server.close();
  }
});

test('página de login aceita apenas redirects internos válidos', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const valid = await fetch(`${baseUrl}/login?redirect=/perfil`, { redirect: 'manual', headers: { Accept: 'text/html' } });
    const invalid = await fetch(`${baseUrl}/login?redirect=https://evil.example`, { redirect: 'manual', headers: { Accept: 'text/html' } });

    const validBody = await valid.text();
    const invalidBody = await invalid.text();

    assert.equal(valid.status, 200);
    assert.match(validBody, /\/perfil/);
    assert.equal(invalid.status, 200);
    assert.match(invalidBody, /\/home/);
  } finally {
    server.close();
  }
});

test('login bem-sucedido preserva redirect seguro e mantém acesso após autenticação', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const loginPage = await fetch(`${baseUrl}/login?redirect=/perfil`, { redirect: 'manual', headers: { Accept: 'text/html' } });
    const loginHtml = await loginPage.text();
    assert.match(loginHtml, /\/perfil/);

    const login = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aluno@teste.com', senha: '123456' }),
      redirect: 'manual'
    });

    assert.equal(login.status, 200);
    const payload = await login.json();
    assert.equal(payload.redirectTo, '/home');

    const setCookie = login.headers.get('set-cookie');
    const cookieHeader = setCookie ? setCookie.split(';')[0] : '';

    const homeResponse = await requestWithCookie(baseUrl, '/home', cookieHeader, { headers: { Accept: 'text/html' } });
    assert.equal(homeResponse.status, 200);
  } finally {
    server.close();
  }
});

test('usuário deslogado é redirecionado para a tela de login ao acessar página protegida', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/home`, { redirect: 'manual' });

    assert.equal(response.status, 302);
    const location = response.headers.get('location');
    assert.ok(location && location.startsWith('/login'));
    assert.match(location, /redirect=/i);
  } finally {
    server.close();
  }
});

test('usuário deslogado não consegue acessar endpoint privado da API', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/api/materias`, {
      redirect: 'manual',
      headers: { Accept: 'application/json' }
    });

    assert.equal(response.status, 401);
    const payload = await response.json();
    assert.match(String(payload.erro || payload.mensagem || ''), /autentic|login|sess/i);
  } finally {
    server.close();
  }
});

test('usuário autenticado pode acessar suas próprias informações, mas não acessa dados de outro usuário', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const cookie = await login(baseUrl);

    const allowed = await requestWithCookie(baseUrl, '/users/u1', cookie);
    assert.equal(allowed.status, 200);

    const forbidden = await requestWithCookie(baseUrl, '/users/u2', cookie);
    assert.equal(forbidden.status, 403);
    const payload = await forbidden.json();
    assert.match(String(payload.erro || payload.mensagem || ''), /permiss|acesso|recurso/i);
  } finally {
    server.close();
  }
});
