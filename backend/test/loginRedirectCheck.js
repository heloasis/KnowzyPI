const app = require('../server');

const server = app.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const page = await fetch(`${baseUrl}/login`, {
    redirect: 'manual',
    headers: { Accept: 'text/html' }
  });
  console.log('LOGIN_STATUS', page.status);
  console.log('LOGIN_BODY_HAS_HOME', (await page.text()).includes('/home'));

  const pageWithRedirect = await fetch(`${baseUrl}/login?redirect=/perfil`, {
    redirect: 'manual',
    headers: { Accept: 'text/html' }
  });
  console.log('LOGIN_WITH_REDIRECT_STATUS', pageWithRedirect.status);
  console.log('LOGIN_WITH_REDIRECT_BODY_HAS_PERFIL', (await pageWithRedirect.text()).includes('/perfil'));

  const pageWithInvalidRedirect = await fetch(`${baseUrl}/login?redirect=https://evil.example`, {
    redirect: 'manual',
    headers: { Accept: 'text/html' }
  });
  console.log('LOGIN_WITH_INVALID_STATUS', pageWithInvalidRedirect.status);
  console.log('LOGIN_WITH_INVALID_BODY_HAS_HOME', (await pageWithInvalidRedirect.text()).includes('/home'));

  const login = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aluno@teste.com', senha: '123456' }),
    redirect: 'manual'
  });
  console.log('POST_LOGIN_STATUS', login.status);
  const body = await login.text();
  console.log('POST_LOGIN_BODY', body);

  const setCookie = login.headers.get('set-cookie');
  console.log('COOKIE_SET', !!setCookie, setCookie ? setCookie.split(';')[0] : '');

  server.close();
});
