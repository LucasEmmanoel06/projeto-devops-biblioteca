# 📚 Sistema de Gerenciamento de Biblioteca

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/SQL-Database-4479A1?style=for-the-badge&logo=postgresql&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/JWT-Secure-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT" />
  <img src="https://img.shields.io/badge/Licen%C3%A7a-MIT-blue?style=for-the-badge" alt="Licença MIT" />
</p>

> Aplicação web para controlo de acervo bibliotecário e autenticação de utilizadores, desenvolvida com arquitetura em camadas (MVC/Repository), boas práticas de desenvolvimento e estruturação para ambientes DevOps.

---

## Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Práticas de DevOps & Próximos Passos](#-práticas-de-devops--próximos-passos)
- [Licença](#-licença)
- [Autor](#-autor)

---

## 📖 Visão Geral

O projeto é composto por:
- **Frontend Estático:** Páginas Web servidas a partir do diretório `public/`, contemplando ecrãs de início de sessão, registo e catálogo de livros, integrando-se com a API através de pedidos assíncronos (`fetch`).
- **Backend RESTful:** Aplicação construída com Express.js, estruturada em controladores (`controllers`), repositórios (`repositories`), rotas, middlewares de segurança e tratamento global de erros.

---

## Funcionalidades

- [x] **Autenticação & Controlo de Acesso:**
  - Registo de novos utilizadores com encriptação segura de palavras-passe.
  - Autenticação e emissão de tokens JWT (JSON Web Token).
  - Middlewares de autorização para proteção de rotas privadas.
- [x] **Gestão do Acervo (CRUD de Livros):**
  - Listagem dos livros registados.
  - Consulta detalhada de obras por identificador.
  - Criação, atualização e remoção de livros do catálogo.
- [x] **Tratamento Centralizado de Erros:**
  - Respostas padronizadas com códigos de estado HTTP adequados.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) |
| **Frontend** | HTML5, CSS3 e JavaScript (Vanilla) |
| **Base de Dados** | SQL relacional (`schema.sql`) |
| **Segurança** | Autenticação baseada em JWT |
| **Arquitetura** | Controllers, Repositories, Middlewares e Ficheiros Estáticos |

---

## 📁 Estrutura do Projeto

```text
projeto-devops-biblioteca/
├── docs/                      # Contratos e especificações da API
│   └── contrato-api-auth.md
├── public/                    # Interface de utilizador (Frontend)
│   ├── css/                   # Folhas de estilo (style.css, biblioteca.css)
│   ├── js/                    # Scripts do cliente (api.js, login.js, etc.)
│   ├── index.html             # Página principal / Login
│   ├── cadastro.html          # Registo de utilizadores
│   └── biblioteca.html        # Catálogo do acervo
├── src/                       # Código-fonte do servidor (Backend)
│   ├── config/                # Gestão de variáveis de ambiente
│   ├── controllers/           # Camada de lógica de controlo
│   ├── db/                    # Scripts SQL e ligação à base de dados
│   ├── middlewares/           # Intercetadores de autenticação e erros
│   ├── repositories/          # Acesso e persistência na base de dados
│   ├── routes/                # Definição das rotas da API
│   ├── app.js                 # Configuração do Express
│   └── server.js              # Inicialização do servidor HTTP
├── .env.example               # Exemplo de configuração de ambiente
├── package.json               # Dependências e comandos do projeto
└── README.md                  # Documentação principal
```

---

## ⚙️ Pré-requisitos

Certifique-se de ter instalado no seu ambiente de trabalho:
- [Node.js](https://nodejs.org/) (versão 18.x LTS ou superior recomendada)
- Gestor de pacotes [npm](https://www.npmjs.com/) ou [yarn]
- Instância de base de dados relacional acessível

---

## 🚀 Instalação e Execução

### 1. Clonar o repositório

```bash
git clone [https://github.com/LucasEmmanoel06/projeto-devops-biblioteca.git](https://github.com/LucasEmmanoel06/projeto-devops-biblioteca.git)
cd projeto-devops-biblioteca
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie o ficheiro `.env` a partir do ficheiro de exemplo:

```bash
cp .env.example .env
```

Abra o `.env` e configure os parâmetros de ligação à sua base de dados e a chave secreta JWT.

### 4. Inicializar a Base de Dados

Execute o ficheiro DDL `src/db/schema.sql` na sua base de dados para criar as tabelas necessárias:

```bash
# Exemplo com PostgreSQL via terminal:
psql -U o_seu_utilizador -d a_sua_base_de_dados -f src/db/schema.sql
```

### 5. Iniciar a aplicação

```bash
# Modo de produção
npm start

# Modo de desenvolvimento
npm run dev
```

Acesse à aplicação no seu navegador:
👉 **`http://localhost:3000`** *(ou na porta configurada no seu ficheiro `.env`)*

---

## 🔒 Variáveis de Ambiente

As principais chaves de configuração suportadas pela aplicação incluem:

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `PORT` | Porta onde o servidor irá escutar | `3000` |
| `DB_HOST` | Endereço do anfitrião da base de dados | `localhost` |
| `DB_PORT` | Porta de comunicação da base de dados | `5432` |
| `DB_USER` | Utilizador da base de dados | `postgres` |
| `DB_PASSWORD` | Palavra-passe da base de dados | `a_sua_palavra_passe` |
| `DB_NAME` | Nome da base de dados | `biblioteca` |
| `JWT_SECRET` | Chave secreta para assinatura dos tokens JWT | `chave_secreta_segura` |

---

## 🔌 Endpoints da API

Para mais detalhes sobre contratos e formatos de resposta, consulte a pasta [`docs/`](./docs/).

### Autenticação (`/api/auth`)

| Método | Rota | Descrição | Requer Autenticação |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Regista um novo utilizador | Não |
| `POST` | `/api/auth/login` | Inicia sessão e retorna o token de acesso | Não |

### Livros (`/api/livros`)

| Método | Rota | Descrição | Requer Autenticação |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/livros` | Lista todos os livros disponíveis | Não |
| `GET` | `/api/livros/:id` | Obtém os detalhes de um livro específico | Não |
| `POST` | `/api/livros` | Regista um novo livro no acervo | **Sim** |
| `PUT` | `/api/livros/:id` | Atualiza os dados de um livro existente | **Sim** |
| `DELETE` | `/api/livros/:id` | Remove um livro do acervo | **Sim** |

---

## 🐳 Práticas de DevOps & Próximos Passos

Evoluções recomendadas para o ciclo de vida e entrega da aplicação:
- [ ] Criação de `Dockerfile` multi-stage para otimização da imagem.
- [ ] Implementação de `docker-compose.yml` para orquestração local (aplicação + base de dados).
- [ ] Pipeline de Integração Contínua (CI) com GitHub Actions (linting, execução de testes unitários e build).
- [ ] Gestão de registos (logs) e observabilidade em ambiente produtivo.

---

## 📄 Licença

Este projeto está distribuído sob a licença **MIT**[cite: 1]. Consulte o ficheiro [LICENSE](./LICENSE) para obter mais informações[cite: 1].

---

## 👤 Autor

Este projeto foi desenvolvido colaborativamente por:

| Colaborador | GitHub | Função |
| :--- | :--- | :--- |
| Lucas Emmanoel | [@LucasEmmanoel06](https://github.com/LucasEmmanoel06) | Tech Lead |
| Emanuel Gondim | [@egondimjraws](https://github.com/egondimjraws) | Testes Unitários |
| Gabriela Pires | [@Gavvdev](https://github.com/gavvdev) | Banco de Dados |
| Lucas Henrique Dias | [@Lucas-henriquedias](https://github.com/lucas-henriquedias) | Frontend |
| Mariana Monteiro | [@Mariana-asm](https://github.com/Mariana-asm) | README.md |
| Miqueias Eduardo | [@Miqueias-eduardo](https://github.com/miqueias-eduardo) | Backend |
| Nayara Medeiros | [@nk-medeiros](https://github.com/nk-medeiros) | Frontend |
