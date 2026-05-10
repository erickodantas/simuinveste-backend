const { Router } = require('express');
const authRoutes = require('./authRoutes');
const metaRoutes = require('./metaRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const taxasRoutes = require('./taxasRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/metas', metaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/taxas', taxasRoutes);

module.exports = router;
