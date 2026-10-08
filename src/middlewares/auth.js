const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

module.exports = function auth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Entre na sua conta para continuar.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = { id: Number(payload.sub), nome: payload.nome };
    next();
  } catch {
    res.status(401).json({ erro: 'Sua sessão expirou. Entre novamente.' });
  }
};
