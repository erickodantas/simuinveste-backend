const nock = require('nock');

const SERIES = { CDI: 12, SELIC: 11, TR: 226 };
const BCB_HOST = 'https://api.bcb.gov.br';

function mockBCB(tipo, valor) {
  return nock(BCB_HOST)
    .get(`/dados/serie/bcdata.sgs.${SERIES[tipo]}/dados/ultimos/1`)
    .query({ formato: 'json' })
    .reply(200, [{ data: '10/05/2026', valor: String(valor) }]);
}

function mockBCBFalha(tipo) {
  return nock(BCB_HOST)
    .get(`/dados/serie/bcdata.sgs.${SERIES[tipo]}/dados/ultimos/1`)
    .query({ formato: 'json' })
    .reply(500, { erro: 'falha simulada' });
}

module.exports = { mockBCB, mockBCBFalha, SERIES, BCB_HOST };
