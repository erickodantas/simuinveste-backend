const express = require('express');
const request = require('supertest');
const nock = require('nock');

const { startMongo, stopMongo, clearMongo } = require('./helpers/db');
const { mockBCB } = require('./helpers/bcb');
const investimentosRoutes = require('../src/routes/investimentosRoutes');

let app;

beforeAll(async () => {
  process.env.TAXAS_TTL_MIN = '720';
  await startMongo();

  app = express();
  app.use(express.json());
  app.use('/api/investimentos', investimentosRoutes);
});

afterAll(async () => {
  nock.cleanAll();
  nock.enableNetConnect();
  await stopMongo();
});

beforeEach(async () => {
  nock.cleanAll();
  await clearMongo();
});

afterEach(() => {
  nock.cleanAll();
});

describe('GET /api/investimentos', () => {
  it('responde 200 com array de produtos com taxa calculada', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');

    const res = await request(app).get('/api/investimentos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((produto) => {
      expect(produto).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          nome: expect.any(String),
          descricao: expect.any(String),
          taxaJurosAnual: expect.any(Number),
          nivelNecessario: expect.any(Number),
          risco: expect.any(String),
          isIsentoIR: expect.any(Boolean),
        }),
      );
      expect(produto.taxaJurosAnual).toBeGreaterThan(0);
    });
  });

  it('é público — dispensa header Authorization', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');

    const res = await request(app).get('/api/investimentos');

    expect(res.status).not.toBe(401);
  });

  it('inclui pelo menos os 5 produtos canônicos do catálogo', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');

    const res = await request(app).get('/api/investimentos');
    const ids = res.body.map((p) => p.id);

    expect(ids).toEqual(
      expect.arrayContaining(['poupanca', 'tesouro-selic', 'cdb-100', 'lci-90', 'lc-118']),
    );
  });
});
