const TIPOS_VALIDOS = ['TEMPO_DEFINIDO', 'APORTE_DEFINIDO', 'ACUMULO_LIVRE'];

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

module.exports = {
  CriarMetaDTO,
  MetaResponseDTO,
};
