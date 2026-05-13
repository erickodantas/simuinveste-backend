const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const {
  CriarUsuarioDTO,
  LoginUsuarioDTO,
  UsuarioResponseDTO,
} = require('../dtos/UsuarioDTO');

const EXPIRACAO_TOKEN = '7d';

const HASH_DUMMY = bcrypt.hashSync('dummy_para_timing_constante', 10);

function gerarToken(usuarioId) {
  return jwt.sign({ id: usuarioId.toString() }, process.env.JWT_SECRET, {
    expiresIn: EXPIRACAO_TOKEN,
  });
}

class UsuarioController {
  static async registrar(req, res) {
    try {
      const dto = new CriarUsuarioDTO(req.body || {});
      const { valido, erros } = dto.validar();

      if (!valido) {
        return res.status(400).json({ erros });
      }

      const jaExiste = await Usuario.findOne({ email: dto.email });
      if (jaExiste) {
        return res.status(409).json({ erro: 'Já existe um usuário com este email.' });
      }

      const usuario = await Usuario.create({
        nome: dto.nome,
        email: dto.email,
        senha: dto.senha,
      });

      const token = gerarToken(usuario._id);

      return res.status(201).json({
        usuario: new UsuarioResponseDTO(usuario),
        token,
      });
    } catch (err) {
      if (err && err.code === 11000) {
        return res.status(409).json({ erro: 'Já existe um usuário com este email.' });
      }
      console.error('[UsuarioController.registrar]', err);
      return res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
    }
  }

  static async login(req, res) {
    try {
      const dto = new LoginUsuarioDTO(req.body || {});
      const { valido, erros } = dto.validar();

      if (!valido) {
        return res.status(400).json({ erros });
      }

      const usuario = await Usuario.findOne({ email: dto.email }).select('+senha');

      if (!usuario) {
        await bcrypt.compare(dto.senha, HASH_DUMMY);
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const senhaConfere = await usuario.compararSenha(dto.senha);
      if (!senhaConfere) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const token = gerarToken(usuario._id);

      return res.json({
        usuario: new UsuarioResponseDTO(usuario),
        token,
      });
    } catch (err) {
      console.error('[UsuarioController.login]', err);
      return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
    }
  }

  static async atualizarNivel(req, res) {
    try {
      const { nivelAtual } = req.body || {};

      if (!Number.isFinite(Number(nivelAtual)) || Number(nivelAtual) < 1) {
        return res.status(400).json({ erro: 'O campo nivelAtual deve ser um número válido (>= 1).' });
      }

      const novoNivel = Number(nivelAtual);

      const usuario = await Usuario.findById(req.usuarioId);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      if (novoNivel > usuario.nivelAtual) {
        usuario.nivelAtual = novoNivel;
        await usuario.save();
      }

      return res.json(new UsuarioResponseDTO(usuario));
    } catch (err) {
      console.error('[UsuarioController.atualizarNivel]', err);
      return res.status(500).json({ erro: 'Erro interno ao atualizar nível.' });
    }
  }
}

module.exports = UsuarioController;
