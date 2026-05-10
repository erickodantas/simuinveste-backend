const { obterTaxas } = require('../services/taxasService');

class TaxasController {
  static async listar(req, res) {
    try {
      const taxas = await obterTaxas();
      return res.json(taxas);
    } catch (err) {
      console.error('[TaxasController.listar]', err);
      return res.status(500).json({ erro: 'Erro interno ao obter taxas.' });
    }
  }
}

module.exports = TaxasController;