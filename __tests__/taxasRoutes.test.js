const express = require('express');
const request = require('supertest');
const nock = require('nock');

const { startMongo, stopMongo, clearMongo } = require('./helpers/db');
const { mockBCB } = require('./helpers/bcb');
const taxasRoutes = require('../src/routes/taxasRoutes');

let app;

beforeAll(async () => {
  process.env.TAXAS_TTL_MIN = '720';
  await startMongo();
  app = express();
  app.use(express.json());
  app.use('/api/taxas', taxasRoutes);
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

describe('GET /api/taxas', () => {
  it('responde 200 com { cdi, selic, tr } numéricos', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');
    const res = await request(app).get('/api/taxas');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      cdi: expect.any(Number),
      selic: expect.any(Number),
      tr: expect.any(Number),
    });
  });

  it('é público — dispensa header Authorization', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');
    const res = await request(app).get('/api/taxas');
    expect(res.status).not.toBe(401);
  });

  it('segunda requisição dentro do TTL não bate na BCB', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');

    await request(app).get('/api/taxas');

    nock.disableNetConnect();
    nock.enableNetConnect(/(127\.0\.0\.1|localhost)/);

    const res = await request(app).get('/api/taxas');

    nock.enableNetConnect();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      cdi: expect.any(Number),
      selic: expect.any(Number),
      tr: expect.any(Number),
    });
  });
});
