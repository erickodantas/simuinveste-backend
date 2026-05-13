const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente em alguns segundos.' },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = authRateLimit;
