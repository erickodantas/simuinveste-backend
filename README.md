# SimuInveste Backend

API REST do projeto SimuInveste construída com Node.js, Express e MongoDB (Mongoose), seguindo Layered Architecture.

## Estrutura

```
src/
  config/         Conexão com banco
  models/         Schemas Mongoose
  dtos/           Validação de entrada e formatação de saída
  middlewares/    Interceptadores (autenticação JWT)
  controllers/    Orquestração das requisições
  routes/         Endpoints da API
  server.js       Bootstrap da aplicação
```

## Pré-requisitos

- Node.js 18+
- MongoDB (local ou remoto)

## Instalação

```bash
npm install
cp .env.example .env
# edite o .env com suas credenciais
npm run dev
```

## Variáveis de ambiente

| Variável     | Descrição                                   |
|--------------|---------------------------------------------|
| `PORT`       | Porta HTTP (padrão `3333`)                  |
| `MONGO_URI`  | String de conexão MongoDB                   |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT       |

## Endpoints

### Autenticação (públicas)

- `POST /api/auth/registrar` — Cria usuário. Body: `{ nome, email, senha }`
- `POST /api/auth/login` — Autentica. Body: `{ email, senha }`. Retorna `{ usuario, token }` (token expira em 7 dias).

### Metas (autenticadas — header `Authorization: Bearer <token>`)

- `POST /api/metas` — Cria meta para o usuário logado.
- `GET /api/metas` — Lista metas do usuário logado.
- `DELETE /api/metas/:id` — Exclui meta (apenas se pertencer ao usuário).

Body de criação de meta:

```json
{
  "nome": "Comprar carro",
  "tipo": "TEMPO_DEFINIDO",
  "valorObjetivo": 50000,
  "valorInicial": 5000,
  "taxaJurosAnual": 10,
  "prazoMeses": 36,
  "aporteMensal": 800
}
```

`tipo` aceita: `TEMPO_DEFINIDO`, `APORTE_DEFINIDO`, `ACUMULO_LIVRE`.

### Progresso (autenticada)

- `PUT /api/usuarios/nivel` — Atualiza `nivelAtual` do usuário (somente se maior que o atual). Body: `{ nivelAtual }`.

## Notas

- Senhas são hasheadas com bcrypt (`pre('save')`) antes de persistir.
- Cálculos de projeção financeira são responsabilidade do frontend; o backend apenas armazena o plano.
