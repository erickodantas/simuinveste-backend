require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { conectarBanco } = require('./config/db');
const rotas = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', servico: 'simuinveste-backend' });
});

app.use('/api', rotas);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((err, req, res, _next) => {
  console.error('[erro-global]', err);
  res.status(500).json({ erro: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3333;

async function iniciar() {
  try {
    await conectarBanco();
    app.listen(PORT, () => {
      console.log(`[server] API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[server] Falha ao iniciar:', err);
    process.exit(1);
  }
}

iniciar();
