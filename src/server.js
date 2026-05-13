require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { conectarBanco } = require('./config/db');
const rotas = require('./routes');

const app = express();

const corsOriginRaw = process.env.CORS_ORIGIN;
const corsAllowList = corsOriginRaw
  ? corsOriginRaw.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsAllowList) {
      if (corsAllowList.includes(origin)) return callback(null, true);
      return callback(new Error('Origem não permitida por CORS.'));
    }
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Origem não permitida por CORS.'));
  },
  credentials: false,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '32kb' }));

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
