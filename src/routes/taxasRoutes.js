const { Router } = require('express');
const TaxasController = require('../controllers/TaxasController');

const router = Router();

router.get('/', TaxasController.listar);

module.exports = router;
