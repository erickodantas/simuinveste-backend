const mongoose = require('mongoose');

const TIPOS_VALIDOS = ['CDI', 'SELIC', 'TR'];

const TaxaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: TIPOS_VALIDOS,
    required: true,
  },
  valorAnual: {
    type: Number,
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
});

TaxaSchema.index({ tipo: 1, fetchedAt: -1 });

module.exports = mongoose.model('Taxa', TaxaSchema);
module.exports.TIPOS_VALIDOS = TIPOS_VALIDOS;
