const nock = require('nock');
const { startMongo, stopMongo, clearMongo } = require('./helpers/db');
const { mockBCB, mockBCBFalha } = require('./helpers/bcb');

const { obterTaxas } = require('../src/services/taxasService');
const Taxa = require('../src/models/Taxa');

beforeAll(async () => {
  process.env.TAXAS_TTL_MIN = '720';
  await startMongo();
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

describe('taxasService.obterTaxas', () => {
  it('busca CDI/Selic/TR da BCB, converte para anual e persiste cada uma como append-only', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.05');
    mockBCB('TR', '0.15');

    const resultado = await obterTaxas();

    expect(resultado).toEqual({
      cdi: expect.any(Number),
      selic: expect.any(Number),
      tr: expect.any(Number),
    });
    expect(resultado.cdi).toBeGreaterThan(0);
    expect(resultado.selic).toBeGreaterThan(0);
    expect(resultado.tr).toBeGreaterThan(0);

    const docs = await Taxa.find({}).sort({ tipo: 1 });
    expect(docs.map((d) => d.tipo).sort()).toEqual(['CDI', 'SELIC', 'TR']);
    docs.forEach((doc) => {
      expect(typeof doc.valorAnual).toBe('number');
      expect(doc.fetchedAt).toBeInstanceOf(Date);
    });
  });

  it('converte taxa diária (CDI/Selic) para anual com ^252', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');

    const r = await obterTaxas();
    const esperadoCDI = (Math.pow(1 + 0.04 / 100, 252) - 1) * 100;
    expect(r.cdi).toBeCloseTo(esperadoCDI, 1);
    expect(r.selic).toBeCloseTo(esperadoCDI, 1);
  });

  it('converte TR mensal para anual com ^12', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');

    const r = await obterTaxas();
    const esperadoTR = (Math.pow(1 + 0.15 / 100, 12) - 1) * 100;
    expect(r.tr).toBeCloseTo(esperadoTR, 1);
  });

  it('não chama a BCB se já existir taxa dentro do TTL', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');
    await obterTaxas();
    nock.disableNetConnect();
    const r2 = await obterTaxas();
    nock.enableNetConnect();

    expect(r2).toEqual({
      cdi: expect.any(Number),
      selic: expect.any(Number),
      tr: expect.any(Number),
    });
    expect(await Taxa.countDocuments({ tipo: 'CDI' })).toBe(1);
    expect(await Taxa.countDocuments({ tipo: 'SELIC' })).toBe(1);
    expect(await Taxa.countDocuments({ tipo: 'TR' })).toBe(1);
  });

  it('rebusca e insere novo doc se a taxa estiver mais velha que o TTL', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');
    await obterTaxas();

    const trezeHorasAtras = new Date(Date.now() - 13 * 60 * 60 * 1000);
    await Taxa.updateMany({}, { $set: { fetchedAt: trezeHorasAtras } });

    mockBCB('CDI', '0.05');
    mockBCB('SELIC', '0.06');
    mockBCB('TR', '0.20');
    await obterTaxas();

    expect(await Taxa.countDocuments({ tipo: 'CDI' })).toBe(2);
    expect(await Taxa.countDocuments({ tipo: 'SELIC' })).toBe(2);
    expect(await Taxa.countDocuments({ tipo: 'TR' })).toBe(2);

    const ultimoCdi = await Taxa.findOne({ tipo: 'CDI' }).sort({ fetchedAt: -1 });
    const esperadoCDI = (Math.pow(1 + 0.05 / 100, 252) - 1) * 100;
    expect(ultimoCdi.valorAnual).toBeCloseTo(esperadoCDI, 1);
  });

  it('devolve a última taxa conhecida (sem inserir) se a BCB falhar e houver histórico', async () => {
    mockBCB('CDI', '0.04');
    mockBCB('SELIC', '0.04');
    mockBCB('TR', '0.15');
    const r1 = await obterTaxas();

    await Taxa.updateMany(
      {},
      { $set: { fetchedAt: new Date(Date.now() - 13 * 60 * 60 * 1000) } },
    );

    mockBCBFalha('CDI');
    mockBCBFalha('SELIC');
    mockBCBFalha('TR');
    const r2 = await obterTaxas();

    expect(r2.cdi).toBeCloseTo(r1.cdi, 5);
    expect(r2.selic).toBeCloseTo(r1.selic, 5);
    expect(r2.tr).toBeCloseTo(r1.tr, 5);

    expect(await Taxa.countDocuments({ tipo: 'CDI' })).toBe(1);
    expect(await Taxa.countDocuments({ tipo: 'SELIC' })).toBe(1);
    expect(await Taxa.countDocuments({ tipo: 'TR' })).toBe(1);
  });

  it('cai para fallback hardcoded se a BCB falhar e não houver histórico', async () => {
    mockBCBFalha('CDI');
    mockBCBFalha('SELIC');
    mockBCBFalha('TR');

    const r = await obterTaxas();
    expect(r.cdi).toBeGreaterThan(0);
    expect(r.selic).toBeGreaterThan(0);
    expect(r.tr).toBeGreaterThan(0);
  });
});
