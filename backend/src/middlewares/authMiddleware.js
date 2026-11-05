const { verifyToken } = require('../utils/authToken');

const isSafeInternalRedirect = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const target = value.trim();

  if (!target || target.startsWith('//') || /^([a-z]+:)?\/\//i.test(target) || /^javascript:/i.test(target) || /^data:/i.test(target)) {
    return false;
  }

  return target.startsWith('/');
};

const isApiRequest = (req) => {
  const acceptHeader = String(req.headers.accept || '');
  return req.path.startsWith('/api') || acceptHeader.includes('application/json') || req.headers['x-requested-with'] === 'XMLHttpRequest';
};

const isHtmlRequest = (req) => !isApiRequest(req) && Boolean(req.accepts('html'));

const normalizeRedirectTarget = (req) => {
  const target = req.originalUrl || req.url || '/home';

  if (!target || target === '/login' || target.startsWith('/login?')) {
    return '/home';
  }

  return isSafeInternalRedirect(target) ? target : '/home';
};

const requireAuth = (req, res, next) => {
  if ((!req.session || !req.session.user) && req.headers.authorization?.startsWith('Bearer ')) {
    const tokenUser = verifyToken(req.headers.authorization.slice(7));
    if (tokenUser) { req.session = req.session || {}; req.session.user = tokenUser; }
  }
  if (req.session && req.session.user) {
    res.locals.usuario = req.session.user;
    return next();
  }

  const redirectTarget = normalizeRedirectTarget(req);
  if (req.session) {
    req.session.returnTo = redirectTarget;
  }

  if (isApiRequest(req)) {
    return res.status(401).json({
      erro: 'Autenticação necessária. Faça login para continuar.'
    });
  }

  if (isHtmlRequest(req)) {
    return res.redirect(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
  }

  return res.status(401).json({
    erro: 'Autenticação necessária. Faça login para continuar.'
  });
};

const requireGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    const redirectTarget = req.session.returnTo || '/home';
    delete req.session.returnTo;
    return res.redirect(redirectTarget);
  }

  next();
};

const requireOwnership = (paramName = 'id') => (req, res, next) => {
  const usuarioLogado = req.session && req.session.user;

  if (!usuarioLogado) {
    return requireAuth(req, res, next);
  }

  const idSolicitado = String(req.params[paramName] || '');
  const idUsuarioLogado = String(usuarioLogado.id || '');

  if (!idSolicitado || idUsuarioLogado === idSolicitado) {
    return next();
  }

  return res.status(403).json({
    erro: 'Você não tem permissão para acessar este recurso.'
  });
};

module.exports = {
  requireAuth,
  requireGuest,
  requireOwnership
};
