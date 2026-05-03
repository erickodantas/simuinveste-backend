const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const partes = headerAuth.split(' ');
  if (partes.length !== 2 || partes[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>.' });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (!payload || !payload.id) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
    req.usuarioId = payload.id;
    return next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
