jest.mock('../src/services/taxasService', () => ({
  obterTaxas: jest.fn(),
}));

const { obterInvestimentos } = require('../src/services/investimentosService');
const { obterTaxas } = require('../src/services/taxasService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('investimentosService.obterInvestimentos', () => {
  it('retorna lista de produtos com a estrutura esperada', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14.27, selic: 14.15, tr: 1.81 });

    const lista = await obterInvestimentos();

    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThan(0);
    lista.forEach((produto) => {
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
    });
  });

  it('Poupança: usa 6.17 + TR quando Selic > 8.5%', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14, selic: 10, tr: 1.5 });

    const poupanca = (await obterInvestimentos()).find((p) => p.id === 'poupanca');

    expect(poupanca).toBeDefined();
    expect(poupanca.taxaJurosAnual).toBeCloseTo(6.17 + 1.5, 4);
  });

  it('Poupança: usa (Selic * 0.7) + TR quando Selic <= 8.5%', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14, selic: 8, tr: 1.5 });

    const poupanca = (await obterInvestimentos()).find((p) => p.id === 'poupanca');

    expect(poupanca.taxaJurosAnual).toBeCloseTo(8 * 0.7 + 1.5, 4);
  });

  it('Tesouro Selic: Selic + 0.05', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14, selic: 10, tr: 1.5 });

    const tesouro = (await obterInvestimentos()).find((p) => p.id === 'tesouro-selic');

    expect(tesouro.taxaJurosAnual).toBeCloseTo(10.05, 4);
  });

  it('CDB 100% CDI: igual ao CDI', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14.27, selic: 10, tr: 1.5 });

    const cdb = (await obterInvestimentos()).find((p) => p.id === 'cdb-100');

    expect(cdb.taxaJurosAnual).toBeCloseTo(14.27, 4);
  });

  it('LCI 90% CDI: CDI * 0.90', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14.27, selic: 10, tr: 1.5 });

    const lci = (await obterInvestimentos()).find((p) => p.id === 'lci-90');

    expect(lci.taxaJurosAnual).toBeCloseTo(14.27 * 0.9, 4);
  });

  it('LC 118% CDI: CDI * 1.18', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14.27, selic: 10, tr: 1.5 });

    const lc = (await obterInvestimentos()).find((p) => p.id === 'lc-118');

    expect(lc.taxaJurosAnual).toBeCloseTo(14.27 * 1.18, 4);
  });

  it('metadados (tier, isenção de IR, risco) seguem o catálogo fixo', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14, selic: 10, tr: 1.5 });

    const lista = await obterInvestimentos();
    const porId = Object.fromEntries(lista.map((p) => [p.id, p]));

    expect(porId['poupanca']).toMatchObject({ nivelNecessario: 1, isIsentoIR: true, risco: 'Baixo' });
    expect(porId['tesouro-selic']).toMatchObject({ nivelNecessario: 1, isIsentoIR: false, risco: 'Baixo' });
    expect(porId['cdb-100']).toMatchObject({ nivelNecessario: 2, isIsentoIR: false, risco: 'Baixo' });
    expect(porId['lci-90']).toMatchObject({ nivelNecessario: 2, isIsentoIR: true, risco: 'Baixo' });
    expect(porId['lc-118']).toMatchObject({ nivelNecessario: 3, isIsentoIR: false, risco: 'Baixo' });
  });

  it('chama taxasService.obterTaxas exatamente uma vez por chamada', async () => {
    obterTaxas.mockResolvedValue({ cdi: 14, selic: 10, tr: 1.5 });

    await obterInvestimentos();

    expect(obterTaxas).toHaveBeenCalledTimes(1);
  });
});
