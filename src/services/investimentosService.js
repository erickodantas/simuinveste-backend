const { obterTaxas } = require('./taxasService');

function calcularTaxaPoupanca(selic, tr) {
  return selic > 8.5 ? 6.17 + tr : selic * 0.7 + tr;
}

function montarCatalogo({ cdi, selic, tr }) {
  return [
    {
      id: 'poupanca',
      nome: 'Poupança',
      descricao: 'O investimento mais tradicional, liquidez imediata.',
      taxaJurosAnual: calcularTaxaPoupanca(selic, tr),
      nivelNecessario: 1,
      risco: 'Baixo',
      isIsentoIR: true,
    },
    {
      id: 'tesouro-selic',
      nome: 'Tesouro Direto (Selic)',
      descricao: 'Empréstimo ao Governo Federal. O mais seguro do país.',
      taxaJurosAnual: selic + 0.05,
      nivelNecessario: 1,
      risco: 'Baixo',
      isIsentoIR: false,
    },
    {
      id: 'cdb-100',
      nome: 'CDB 100% CDI',
      descricao: 'Empréstimo para bancos com garantia do FGC.',
      taxaJurosAnual: cdi,
      nivelNecessario: 2,
      risco: 'Baixo',
      isIsentoIR: false,
    },
    {
      id: 'lci-90',
      nome: 'LCI 90% CDI',
      descricao: 'Focado no setor imobiliário e isento de IR.',
      taxaJurosAnual: cdi * 0.9,
      nivelNecessario: 2,
      risco: 'Baixo',
      isIsentoIR: true,
    },
    {
      id: 'lc-118',
      nome: 'Letra de Câmbio 118% CDI',
      descricao: 'Emitido por financeiras, rentabilidade maior.',
      taxaJurosAnual: cdi * 1.18,
      nivelNecessario: 3,
      risco: 'Baixo',
      isIsentoIR: false,
    },
  ];
}

async function obterInvestimentos() {
  const taxas = await obterTaxas();
  return montarCatalogo(taxas);
}

module.exports = { obterInvestimentos };
