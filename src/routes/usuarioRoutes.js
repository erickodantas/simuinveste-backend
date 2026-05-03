const { Router } = require('express');
const UsuarioController = require('../controllers/UsuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.put('/nivel', UsuarioController.atualizarNivel);

module.exports = router;
