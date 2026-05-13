const { Router } = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const authRateLimit = require('../middlewares/authRateLimit');

const router = Router();

router.post('/registrar', authRateLimit, UsuarioController.registrar);
router.post('/login', authRateLimit, UsuarioController.login);

module.exports = router;
