const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  senha: {
    type: String,
    required: true,
    select: false,
  },
  nivelAtual: {
    type: Number,
    default: 1,
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
});

UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

UsuarioSchema.methods.compararSenha = function (senhaTextoPlano) {
  return bcrypt.compare(senhaTextoPlano, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
