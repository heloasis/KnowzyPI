const crypto = require('crypto');
const secret = () => process.env.AUTH_TOKEN_SECRET || process.env.SESSION_SECRET || 'dev-only-change-this-auth-secret';
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (input) => crypto.createHmac('sha256', secret()).update(input).digest('base64url');
const createToken = (user, ttlSeconds = 60 * 60 * 24 * 7) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: String(user.id), nome: user.nome || '', email: user.email || '', xp: Number(user.xp || 0), iat: now, exp: now + ttlSeconds };
  const content = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  return `${content}.${sign(content)}`;
};
const verifyToken = (token) => {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const content = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(content));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: payload.sub, nome: payload.nome, email: payload.email, xp: payload.xp };
  } catch { return null; }
};
module.exports = { createToken, verifyToken };
