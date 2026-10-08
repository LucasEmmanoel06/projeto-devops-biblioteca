# Contrato da API de autenticação

Combinado entre **Frontend** e **Backend**. As telas `index.html` (login) e
`cadastro.html` já consomem exatamente o que está descrito aqui. Se o backend
precisar mudar algo, atualizem este arquivo e avisem o frontend.

Formato: JSON (`Content-Type: application/json`). Erros sempre no formato `{ "erro": "mensagem em português" }`.

## POST /api/auth/cadastro

Corpo:
```json
{ "nome": "Maria Silva", "email": "maria@exemplo.com", "senha": "minhasenha123" }
```

| Status | Quando | Corpo |
|---|---|---|
| 201 | Conta criada | `{ "id": 1, "nome": "Maria Silva", "email": "maria@exemplo.com" }` |
| 400 | Campo ausente/inválido (senha < 8 caracteres, e-mail inválido...) | `{ "erro": "..." }` |
| 409 | E-mail já cadastrado | `{ "erro": "E-mail já cadastrado." }` |

Regras: e-mail único; salvar apenas o **hash** da senha (`senha_hash`, ex.: bcrypt/argon2), nunca a senha.

## POST /api/auth/login

Corpo:
```json
{ "email": "maria@exemplo.com", "senha": "minhasenha123" }
```

| Status | Quando | Corpo |
|---|---|---|
| 200 | Credenciais corretas | `{ "token": "<JWT>", "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@exemplo.com" } }` |
| 400 | Campo ausente | `{ "erro": "..." }` |
| 401 | E-mail ou senha incorretos | `{ "erro": "E-mail ou senha incorretos." }` |

Use a mesma mensagem para e-mail inexistente e senha errada (não revelar quais e-mails existem).

## Rotas protegidas

O frontend envia `Authorization: Bearer <token>` em toda rota de livros.
Token inválido/expirado → `401`; o frontend deve encerrar a sessão e voltar ao login.

## Sessão no frontend

`localStorage`: `biblioteca_token` e `biblioteca_usuario`. Após o login, o usuário é
redirecionado para `biblioteca.html` (tela de livros, feita por outro integrante).

## CORS

Se o frontend rodar em outra porta que o backend, habilite CORS para a origem do frontend
e ajuste `API_BASE` em `frontend/js/config.js`. Com Docker Compose, o ideal é servir tudo na mesma origem.