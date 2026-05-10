const TIPOS_VALIDOS = ['TEMPO_DEFINIDO', 'APORTE_DEFINIDO', 'ACUMULO_LIVRE'];
const STATUS_VALIDOS = ['EM_ANDAMENTO', 'CONCLUIDA'];

class CriarMetaDTO {
  constructor(body) {
    this.nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    this.tipo = body.tipo;
    this.valorObjetivo = Number(body.valorObjetivo);
    this.valorInicial = body.valorInicial !== undefined ? Number(body.valorInicial) : 0;
    this.taxaJurosAnual = Number(body.taxaJurosAnual);
    this.prazoMeses = Number(body.prazoMeses);
    this.aporteMensal = Number(body.aporteMensal);
  }

  validar() {
    const erros = [];

    if (!this.nome) {
      erros.push('O campo nome é obrigatório.');
    }

    if (!TIPOS_VALIDOS.includes(this.tipo)) {
      erros.push(`O campo tipo deve ser um de: ${TIPOS_VALIDOS.join(', ')}.`);
    }

    if (!Number.isFinite(this.valorObjetivo) || this.valorObjetivo <= 0) {
      erros.push('O campo valorObjetivo deve ser um número maior que zero.');
    }

    if (!Number.isFinite(this.valorInicial) || this.valorInicial < 0) {
      erros.push('O campo valorInicial deve ser um número maior ou igual a zero.');
    }

    if (!Number.isFinite(this.taxaJurosAnual) || this.taxaJurosAnual < 0) {
      erros.push('O campo taxaJurosAnual deve ser um número maior ou igual a zero.');
    }

    if (!Number.isFinite(this.prazoMeses) || this.prazoMeses <= 0) {
      erros.push('O campo prazoMeses deve ser um número maior que zero.');
    }

    if (!Number.isFinite(this.aporteMensal) || this.aporteMensal < 0) {
      erros.push('O campo aporteMensal deve ser um número maior ou igual a zero.');
    }

    return {
      valido: erros.length === 0,
      erros,
    };
  }
}

class MetaResponseDTO {
  constructor(meta) {
    this.id = meta._id ? meta._id.toString() : meta.id;
    this.nome = meta.nome;
    this.tipo = meta.tipo;
    this.valorObjetivo = meta.valorObjetivo;
    this.valorInicial = meta.valorInicial;
    this.taxaJurosAnual = meta.taxaJurosAnual;
    this.prazoMeses = meta.prazoMeses;
    this.aporteMensal = meta.aporteMensal;
    this.status = meta.status;
  }
}

class AtualizarMetaDTO {
  constructor(body) {
    this.alteracoes = {};
    this.erros = [];

    if (body.nome !== undefined) {
      const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
      if (!nome) {
        this.erros.push('O campo nome não pode ser vazio.');
      } else {
        this.alteracoes.nome = nome;
      }
    }

    if (body.tipo !== undefined) {
      if (!TIPOS_VALIDOS.includes(body.tipo)) {
        this.erros.push(`O campo tipo deve ser um de: ${TIPOS_VALIDOS.join(', ')}.`);
      } else {
        this.alteracoes.tipo = body.tipo;
      }
    }

    if (body.status !== undefined) {
      if (!STATUS_VALIDOS.includes(body.status)) {
        this.erros.push(`O campo status deve ser um de: ${STATUS_VALIDOS.join(', ')}.`);
      } else {
        this.alteracoes.status = body.status;
      }
    }

    const numericos = [
      { campo: 'valorObjetivo', min: 0, exclusivo: true },
      { campo: 'valorInicial', min: 0, exclusivo: false },
      { campo: 'taxaJurosAnual', min: 0, exclusivo: false },
      { campo: 'prazoMeses', min: 0, exclusivo: true },
      { campo: 'aporteMensal', min: 0, exclusivo: false },
    ];

    for (const { campo, min, exclusivo } of numericos) {
      if (body[campo] === undefined) continue;
      const valor = Number(body[campo]);
      const minOk = exclusivo ? valor > min : valor >= min;
      if (!Number.isFinite(valor) || !minOk) {
        const sufixo = exclusivo ? `maior que ${min}` : `maior ou igual a ${min}`;
        this.erros.push(`O campo ${campo} deve ser um número ${sufixo}.`);
      } else {
        this.alteracoes[campo] = valor;
      }
    }
  }

  validar() {
    return {
      valido: this.erros.length === 0 && Object.keys(this.alteracoes).length > 0,
      erros: this.erros.length > 0
        ? this.erros
        : ['Informe ao menos um campo para atualizar.'],
    };
  }
}

module.exports = {
  CriarMetaDTO,
  AtualizarMetaDTO,
  MetaResponseDTO,
};
