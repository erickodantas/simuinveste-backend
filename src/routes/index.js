const { Router } = require('express');
const authRoutes = require('./authRoutes');
const metaRoutes = require('./metaRoutes');
const usuarioRoutes = require('./usuarioRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/metas', metaRoutes);
router.use('/usuarios', usuarioRoutes);

module.exports = router;
