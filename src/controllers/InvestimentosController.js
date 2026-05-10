const { obterInvestimentos } = require('../services/investimentosService');

class InvestimentosController {
  static async listar(req, res) {
    try {
      const lista = await obterInvestimentos();
      return res.json(lista);
    } catch (err) {
      console.error('[InvestimentosController.listar]', err);
      return res.status(500).json({ erro: 'Erro interno ao obter investimentos.' });
    }
  }
}

module.exports = InvestimentosController;
