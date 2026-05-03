const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class CriarUsuarioDTO {
  constructor({ nome, email, senha }) {
    this.nome = typeof nome === 'string' ? nome.trim() : '';
    this.email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    this.senha = typeof senha === 'string' ? senha : '';
  }

  validar() {
    const erros = [];

    if (!this.nome) {
      erros.push('O campo nome é obrigatório.');
    }

    if (!this.email) {
      erros.push('O campo email é obrigatório.');
    } else if (!REGEX_EMAIL.test(this.email)) {
      erros.push('O email informado é inválido.');
    }

    if (!this.senha) {
      erros.push('O campo senha é obrigatório.');
    } else if (this.senha.length < 6) {
      erros.push('A senha deve ter no mínimo 6 caracteres.');
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }
}

class LoginUsuarioDTO {
  constructor({ email, senha }) {
    this.email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    this.senha = typeof senha === 'string' ? senha : '';
  }

  validar() {
    const erros = [];

    if (!this.email) {
      erros.push('O campo email é obrigatório.');
    }

    if (!this.senha) {
      erros.push('O campo senha é obrigatório.');
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }
}

class UsuarioResponseDTO {
  constructor(usuario) {
    this.id = usuario._id ? usuario._id.toString() : usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.nivelAtual = usuario.nivelAtual;
  }
}

module.exports = {
  CriarUsuarioDTO,
  LoginUsuarioDTO,
  UsuarioResponseDTO,
};
