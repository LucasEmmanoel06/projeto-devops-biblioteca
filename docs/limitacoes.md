# Limitações conhecidas

Registro do que o sistema não faz, ou faz de forma simples, para que quem receber o projeto saiba o que esperar.

## Autenticação

- Não há recuperação de senha nem confirmação de e-mail.
- O token JWT vale 7 dias e não é renovado. Quando expira, é preciso entrar de novo.
- O logout apenas apaga o token do navegador (`localStorage`). O token não é invalidado no servidor.
- A senha exige apenas 6 caracteres, sem regras de complexidade.
- Não há limite de tentativas de login (rate limiting).

## Livros

- Cada usuário vê apenas os seus livros. Não existe compartilhamento nem catálogo comum.
- A API permite editar um livro (`PUT /api/livros/:id`), mas a tela ainda não tem botão de edição. Pela interface é possível cadastrar, buscar e excluir.
- A listagem não tem paginação nem ordenação configurável.
- A busca procura o texto no título ou no autor, sem tratamento de acentos ou ortografia.
- O ano precisa ser um número inteiro entre 1 e o ano atual.

## Banco de dados

- O `db.sql` apaga e recria as tabelas (`DROP TABLE`). Rodá-lo em um banco com dados reais apaga tudo.
- O script cria um usuário e livros de exemplo (`exemplo@email.com`, senha `Senha123`), destinados apenas a testes.
- Não há sistema de migrações: mudanças no banco são feitas editando o `db.sql`.

## Arquitetura e execução

- O frontend é servido pelo próprio Express. Não há CORS configurado, então servir o frontend em outro endereço exige ajustar a API.
- O servidor depende de um MySQL em execução e já criado antes de iniciar.
- Os testes automatizados (`npm test`) usam dados simulados e não acessam um banco real. Não há testes de integração nem de interface.
- Ainda não há Dockerfile, Docker Compose nem pipeline de CI/CD (previstos para a Parte 2).