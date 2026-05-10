const { Router } = require('express');
const MetaController = require('../controllers/MetaController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/', MetaController.criar);
router.get('/', MetaController.listar);
router.put('/:id', MetaController.atualizar);
router.delete('/:id', MetaController.deletar);

module.exports = router;
