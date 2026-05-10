const { Router } = require('express');
const InvestimentosController = require('../controllers/InvestimentosController');

const router = Router();

router.get('/', InvestimentosController.listar);

module.exports = router;
