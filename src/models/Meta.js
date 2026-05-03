const mongoose = require('mongoose');

const MetaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true,
  },
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  tipo: {
    type: String,
    enum: ['TEMPO_DEFINIDO', 'APORTE_DEFINIDO', 'ACUMULO_LIVRE'],
    required: true,
  },
  valorObjetivo: {
    type: Number,
    required: true,
  },
  valorInicial: {
    type: Number,
    default: 0,
  },
  taxaJurosAnual: {
    type: Number,
    required: true,
  },
  prazoMeses: {
    type: Number,
    required: true,
  },
  aporteMensal: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['EM_ANDAMENTO', 'CONCLUIDA'],
    default: 'EM_ANDAMENTO',
  },
});

module.exports = mongoose.model('Meta', MetaSchema);
