# Contrato da API de autenticação

Combinado entre **Frontend** e **Backend**. As telas `index.html` (login) e `cadastro.html` consomem exatamente o que está descrito aqui. Se o backend mudar algo, atualizem este arquivo e avisem o frontend.

Formato: JSON (`Content-Type: application/json`). Erros sempre no formato `{ "erro": "mensagem em português" }`.

## POST /api/auth/cadastro

Corpo:
```json
{ "nome": "Maria Silva", "email": "maria@exemplo.com", "senha": "minhasenha123" }
```

| Status | Quando | Corpo |
|---|---|---|
| 201 | Conta criada | `{ "token": "<JWT>", "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@exemplo.com" } }` |
| 400 | Nome vazio, e-mail inválido ou senha com menos de 6 caracteres | `{ "erro": "..." }` |
| 409 | E-mail já cadastrado | `{ "erro": "Este e-mail já está cadastrado." }` |

Regras: e-mail único (salvo em minúsculas); apenas o **hash** da senha é salvo (`senha_hash`, bcrypt), nunca a senha. Após o cadastro, o usuário já recebe o token.

## POST /api/auth/login

Corpo:
```json
{ "email": "maria@exemplo.com", "senha": "minhasenha123" }
```

| Status | Quando | Corpo |
|---|---|---|
| 200 | Credenciais corretas | `{ "token": "<JWT>", "usuario": { "id": 1, "nome": "Maria Silva", "email": "maria@exemplo.com" } }` |
| 401 | E-mail ou senha incorretos, ou campos ausentes | `{ "erro": "E-mail ou senha incorretos." }` |

A mesma mensagem é usada para e-mail inexistente e senha errada, para não revelar quais e-mails existem.

## Rotas protegidas

O frontend envia `Authorization: Bearer <token>` em toda rota de livros. Token ausente, inválido ou expirado retorna `401`, e o frontend encerra a sessão e volta ao login. O token vale 7 dias.

## Sessão no frontend

`localStorage`: `biblioteca_token` e `biblioteca_usuario`. Após o login ou cadastro, o usuário é redirecionado para `biblioteca.html`.

## CORS

O Express serve o frontend e a API na mesma origem, então não há CORS configurado. Se o frontend rodar em outro endereço, será preciso habilitar CORS no backend e ajustar `API_BASE` em `public/js/config.js`.
