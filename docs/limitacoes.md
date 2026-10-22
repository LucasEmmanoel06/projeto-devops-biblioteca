# Limitações Conhecidas

Registro do que o sistema não faz, ou faz de forma simples, para que quem receber o projeto possa evoluir sem surpresas.

## Autenticação e segurança

- Os tokens JWT expiram em 7 dias. Não há refresh token nem revogação (logout invalida apenas no cliente).
- A senha precisa de no mínimo 6 caracteres, sem exigência de números ou símbolos.
- Não há recuperação de senha ("esqueci minha senha").
- Não há bloqueio por tentativas repetidas de login (brute force).

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
- Os testes automatizados (`npm test`) cobrem lógica de negócio, controllers e repositórios.
- Dockerfile multi-stage, Docker Compose e pipeline de CI/CD no GitHub Actions implementados para automação de testes, lint, SAST, build e DAST.
