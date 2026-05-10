const axios = require('axios');
const Taxa = require('../models/Taxa');

const SERIES = {
  CDI:   { codigo: 12,  periodo: 'diario', fallbackBruto: 0.04 },
  SELIC: { codigo: 11,  periodo: 'diario', fallbackBruto: 0.04 },
  TR:    { codigo: 226, periodo: 'mensal', fallbackBruto: 0.15 },
};

const TTL_DEFAULT_MIN = 720;

function urlSGS(codigo) {
  return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`;
}

function paraAnual(valorBruto, periodo) {
  const expoente = periodo === 'diario' ? 252 : 12;
  return (Math.pow(1 + valorBruto / 100, expoente) - 1) * 100;
}

function ttlMs() {
  const minutos = parseInt(process.env.TAXAS_TTL_MIN, 10);
  return (Number.isFinite(minutos) && minutos > 0 ? minutos : TTL_DEFAULT_MIN) * 60 * 1000;
}

async function obterTaxaPorTipo(tipo) {
  const config = SERIES[tipo];
  const ultima = await Taxa.findOne({ tipo }).sort({ fetchedAt: -1 });

  if (ultima && Date.now() - ultima.fetchedAt.getTime() < ttlMs()) {
    return ultima.valorAnual;
  }

  let valorBruto;
  try {
    const { data } = await axios.get(urlSGS(config.codigo));
    valorBruto = parseFloat(data[0].valor);
  } catch (err) {
    console.warn(`[taxasService] Falha ao buscar ${tipo} na BCB: ${err.message}`);
    if (ultima) return ultima.valorAnual;
    return paraAnual(config.fallbackBruto, config.periodo);
  }

  const valorAnual = paraAnual(valorBruto, config.periodo);
  await Taxa.create({ tipo, valorAnual });
  return valorAnual;
}

function arredondar(valor) {
  return parseFloat(valor.toFixed(2));
}

async function obterTaxas() {
  const [cdi, selic, tr] = await Promise.all([
    obterTaxaPorTipo('CDI'),
    obterTaxaPorTipo('SELIC'),
    obterTaxaPorTipo('TR'),
  ]);
  return {
    cdi: arredondar(cdi),
    selic: arredondar(selic),
    tr: arredondar(tr),
  };
}

module.exports = { obterTaxas };
