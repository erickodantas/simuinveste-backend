const { Router } = require('express');
const UsuarioController = require('../controllers/UsuarioController');

const router = Router();

router.post('/registrar', UsuarioController.registrar);
router.post('/login', UsuarioController.login);

module.exports = router;
