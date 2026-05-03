const mongoose = require('mongoose');
const Meta = require('../models/Meta');
const { CriarMetaDTO, MetaResponseDTO } = require('../dtos/MetaDTO');

class MetaController {
  static async criar(req, res) {
    try {
      const dto = new CriarMetaDTO(req.body || {});
      const { valido, erros } = dto.validar();

      if (!valido) {
        return res.status(400).json({ erros });
      }

      const meta = await Meta.create({
        usuarioId: req.usuarioId,
        nome: dto.nome,
        tipo: dto.tipo,
        valorObjetivo: dto.valorObjetivo,
        valorInicial: dto.valorInicial,
        taxaJurosAnual: dto.taxaJurosAnual,
        prazoMeses: dto.prazoMeses,
        aporteMensal: dto.aporteMensal,
      });

      return res.status(201).json(new MetaResponseDTO(meta));
    } catch (err) {
      console.error('[MetaController.criar]', err);
      return res.status(500).json({ erro: 'Erro interno ao criar meta.' });
    }
  }

  static async listar(req, res) {
    try {
      const metas = await Meta.find({ usuarioId: req.usuarioId }).sort({ _id: -1 });
      return res.json(metas.map((meta) => new MetaResponseDTO(meta)));
    } catch (err) {
      console.error('[MetaController.listar]', err);
      return res.status(500).json({ erro: 'Erro interno ao listar metas.' });
    }
  }

  static async deletar(req, res) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ erro: 'ID de meta inválido.' });
      }

      const meta = await Meta.findOneAndDelete({
        _id: id,
        usuarioId: req.usuarioId,
      });

      if (!meta) {
        return res.status(404).json({ erro: 'Meta não encontrada.' });
      }

      return res.status(204).send();
    } catch (err) {
      console.error('[MetaController.deletar]', err);
      return res.status(500).json({ erro: 'Erro interno ao deletar meta.' });
    }
  }
}

module.exports = MetaController;
