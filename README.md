# 📚 Sistema de Gerenciamento de Biblioteca

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-Secure-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge" alt="Licença MIT" />
</p>

> Aplicação web para controle de acervo bibliotecário e autenticação de usuários, desenvolvida com arquitetura em camadas (MVC/Repository), boas práticas de desenvolvimento e estruturação para ambientes DevOps.

Projeto do **Grupo 2** da disciplina DevOps (Aponti FAP, turma 5, 2026). Esta é a **Parte 1** (sistema web). A Parte 2 (testes, Docker e pipeline) é feita pelo grupo que receber o projeto.

---

## Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Testes](#-testes)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Banco de Dados](#-banco-de-dados)
- [Limitações Conhecidas](#-limitações-conhecidas)
- [Próximos Passos (Parte 2)](#-próximos-passos-parte-2)
- [Licença](#-licença)
- [Equipe](#-equipe)

---

## 📖 Visão Geral

O projeto é composto por:
- **Frontend estático:** páginas web servidas a partir do diretório `public/`, com telas de login, cadastro e catálogo de livros, que se integram à API por meio de requisições assíncronas (`fetch`).
- **Backend RESTful:** aplicação construída com Express.js, estruturada em controllers, repositories, rotas, middlewares de segurança e tratamento global de erros.

---

## ✨ Funcionalidades

- [x] **Autenticação e controle de acesso:**
  - Cadastro de novos usuários, com senha armazenada como hash (bcrypt).
  - Login e emissão de tokens JWT (JSON Web Token) com validade de 7 dias.
  - Middleware de autorização para proteção das rotas privadas.
- [x] **Gestão do acervo (livros):**
  - Cadastro de livros (título, autor e ano).
  - Listagem e busca por título ou autor.
  - Exclusão de livros.
  - Cada usuário enxerga apenas os seus próprios livros.
- [x] **Tratamento centralizado de erros:**
  - Respostas padronizadas, no formato `{ "erro": "mensagem" }`, com códigos HTTP adequados.

A API também permite editar livros (`PUT`), mas a tela ainda não tem esse botão. Veja as [limitações conhecidas](./docs/limitacoes.md).

---

## 🧰 Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | [Node.js](https://nodejs.org/) e [Express.js](https://expressjs.com/) 4 |
| **Frontend** | HTML5, CSS3 e JavaScript (Vanilla), servido pelo próprio Express |
| **Banco de dados** | MySQL 8 (driver `mysql2`), script `db.sql` |
| **Segurança** | Autenticação com JWT (`jsonwebtoken`) e `bcryptjs` |
| **Testes** | Executor de testes nativo do Node (`node --test`) |
| **Arquitetura** | Controllers, Repositories, Middlewares e arquivos estáticos |

---

## 🧱 Arquitetura

O backend é organizado em camadas:

```text
Requisição -> Rota -> Middleware (JWT) -> Controller -> Repositório -> MySQL
```

- **routes:** define as URLs e liga cada uma ao controller
- **middlewares:** autenticação (`auth.js`) e tratamento de erros (`errorHandler.js`)
- **controllers:** validação dos dados e regras de negócio
- **repositories:** consultas SQL, sempre com parâmetros (`?`)
- **config e db:** leitura do `.env` e pool de conexões com o MySQL

O Express também serve a pasta `public/`, então frontend e API ficam na mesma origem.

---

## 📁 Estrutura do Projeto

```text
projeto-devops-biblioteca/
├── db.sql                     # Script do banco (tabelas e dados de exemplo)
├── docs/                      # Documentação do projeto
│   ├── contrato-api-auth.md   # Contrato da API de autenticação
│   ├── limitacoes.md          # Limitações conhecidas
│   ├── modelo-banco.md        # Modelo do banco de dados
│   └── variaveis-de-ambiente.md
├── public/                    # Interface de usuário (Frontend)
│   ├── css/                   # Folhas de estilo (style.css, biblioteca.css)
│   ├── js/                    # Scripts do cliente (api.js, login.js, etc.)
│   ├── index.html             # Página principal / Login
│   ├── cadastro.html          # Cadastro de usuários
│   └── biblioteca.html        # Catálogo do acervo
├── src/                       # Código-fonte do servidor (Backend)
│   ├── config/                # Leitura das variáveis de ambiente
│   ├── controllers/           # Camada de lógica de controle
│   ├── db/                    # Conexão com o banco de dados
│   ├── middlewares/           # Autenticação e tratamento de erros
│   ├── repositories/          # Acesso e persistência no banco
│   ├── routes/                # Definição das rotas da API
│   ├── app.js                 # Configuração do Express
│   └── server.js              # Inicialização do servidor HTTP
├── tests/                     # Testes automatizados
├── .env.example               # Exemplo de configuração de ambiente
├── package.json               # Dependências e comandos do projeto
└── README.md                  # Documentação principal
```

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) 22 LTS ou superior (o `npm test` usa um padrão de arquivos que exige Node 21+)
- Gerenciador de pacotes [npm](https://www.npmjs.com/)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) 8 em execução

---

## 🚀 Instalação e Execução

### 1. Clonar o repositório

```bash
git clone https://github.com/LucasEmmanoel06/projeto-devops-biblioteca.git
cd projeto-devops-biblioteca
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

No Windows (PowerShell), use `copy .env.example .env`.

Abra o `.env` e configure os dados de conexão com o banco (principalmente `DB_PASSWORD`) e a chave secreta `JWT_SECRET`. Detalhes em [variáveis de ambiente](./docs/variaveis-de-ambiente.md).

### 4. Inicializar o banco de dados

Execute o script `db.sql` no MySQL para criar as tabelas:

```bash
mysql -u root -p < db.sql
```

No Windows (PowerShell), o símbolo `<` não funciona. Use o comando abaixo, na pasta do projeto:

```powershell
mysql -u root -p -e "source db.sql"
```

Também é possível abrir o `db.sql` no MySQL Workbench ou no HeidiSQL e executá-lo. Atenção: o script apaga e recria as tabelas.

### 5. Iniciar a aplicação

```bash
# Modo normal
npm start

# Modo de desenvolvimento (reinicia ao salvar)
npm run dev
```

Acesse a aplicação no navegador:
👉 **`http://localhost:3000`** *(ou na porta configurada no seu arquivo `.env`)*

Para entrar sem criar conta, use o usuário de exemplo do `db.sql`: `exemplo@email.com` / `Senha123` (apenas para testes).

---

## 🧪 Testes

```bash
npm test
```

São testes unitários de controllers, repositories, middlewares e configuração. Eles usam dados simulados e **não precisam de MySQL**. Basta ter executado `npm install`.

---

## 🔒 Variáveis de Ambiente

As chaves de configuração suportadas pela aplicação são:

| Variável | Obrigatória | Descrição | Exemplo |
| :--- | :---: | :--- | :--- |
| `PORT` | Não (padrão `3000`) | Porta onde o servidor irá escutar | `3000` |
| `JWT_SECRET` | **Sim** | Chave secreta para assinatura dos tokens JWT | `troque-por-um-segredo-longo` |
| `DB_HOST` | Não (padrão `localhost`) | Endereço do servidor do banco | `localhost` |
| `DB_PORT` | Não (padrão `3306`) | Porta do banco de dados | `3306` |
| `DB_USER` | Não (padrão `root`) | Usuário do banco | `root` |
| `DB_PASSWORD` | Não (padrão vazio) | Senha do banco | `sua_senha` |
| `DB_NAME` | Não (padrão `biblioteca`) | Nome do banco de dados | `biblioteca` |

Sem `JWT_SECRET` a aplicação não inicia. O arquivo `.env` não é versionado.

---

## 🔌 Endpoints da API

Formato JSON. Para mais detalhes sobre contratos e formatos de resposta, consulte a pasta [`docs/`](./docs/) e o arquivo [contrato-api-auth.md](./docs/contrato-api-auth.md).

### Saúde

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/health` | Retorna `{ "status": "ok" }` |

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Respostas |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/cadastro` | Cria um usuário (`nome`, `email`, `senha`) | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | Inicia sessão (`email`, `senha`) e retorna o token | `200`, `401` |

### Livros (`/api/livros`)

(Requer autenticação: cabeçalho `Authorization: Bearer <token>`. Sem token válido, a resposta é `401`.)

| Método | Rota | Descrição | Respostas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/livros` | Lista os livros do usuário. Aceita `?busca=texto` (título ou autor) | `200` |
| `POST` | `/api/livros` | Cadastra um livro (`titulo`, `autor`, `ano` opcional) | `201`, `400` |
| `PUT` | `/api/livros/:id` | Atualiza os dados de um livro existente | `200`, `400`, `404` |
| `DELETE` | `/api/livros/:id` | Remove um livro do acervo | `200`, `404` |

---

## 💾 Banco de Dados

Duas tabelas: `usuarios` e `livros` (um usuário tem vários livros). O diagrama e a descrição das colunas estão em [modelo-banco.md](./docs/modelo-banco.md).

---

## 🚧 Limitações Conhecidas

Veja a lista completa em [limitacoes.md](./docs/limitacoes.md).

---

## 🐳 Próximos Passos (Parte 2)

Evoluções previstas para o ciclo de vida e a entrega da aplicação:
- [x] Criação de `Dockerfile` multi-stage para otimização da imagem.
- [x] Implementação de `docker-compose.yml` para orquestração local (aplicação + banco, com volume persistente).
- [x] Pipeline de Integração Contínua (CI) com GitHub Actions (instalação, testes, build, SAST e DAST).
- [ ] Gestão de logs e observabilidade em ambiente produtivo.

---

## 📄 Licença

Este projeto está distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para obter mais informações.

---

## 👥 Equipe

Este projeto foi desenvolvido colaborativamente por:

| Colaborador | GitHub | Função |
| :--- | :--- | :--- |
| Lucas Emmanoel | [@LucasEmmanoel06](https://github.com/LucasEmmanoel06) | Tech Lead |
| Emanuel Gondim | [@egondimjraws](https://github.com/egondimjraws) | Testes Unitários |
| Gabriela Pires | [@Gavvdev](https://github.com/gavvdev) | Scrum Master e Banco de Dados |
| Lucas Henrique Dias | [@Lucas-henriquedias](https://github.com/lucas-henriquedias) | Frontend |
| Mariana Monteiro | [@Mariana-asm](https://github.com/Mariana-asm) | README.md |
| Miqueias Eduardo | [@Miqueias-eduardo](https://github.com/miqueias-eduardo) | Backend |
| Nayara Medeiros | [@nk-medeiros](https://github.com/nk-medeiros) | Frontend |