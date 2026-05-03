const mongoose = require('mongoose');

async function conectarBanco() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Variável de ambiente MONGO_URI não definida.');
  }

  await mongoose.connect(uri);
  console.log('[DB] Conexão com MongoDB estabelecida com sucesso.');
}

module.exports = { conectarBanco };
