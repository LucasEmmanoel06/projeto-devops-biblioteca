# Variáveis de ambiente

A aplicação lê as configurações do arquivo `.env` (na raiz do projeto). Para criar o seu:

```bash
cp .env.example .env
```

Depois edite o `.env` com os seus valores. O `.env` não vai para o Git (está no `.gitignore`); apenas o `.env.example`, com valores fictícios, é versionado.

| Variável | Obrigatória | Padrão | Descrição | Exemplo |
|---|---|---|---|---|
| `PORT` | Não | `3000` | Porta em que o servidor escuta | `3000` |
| `JWT_SECRET` | **Sim** | — | Chave usada para assinar e validar os tokens JWT | `troque-por-um-segredo-longo-e-aleatorio` |
| `DB_HOST` | Não | `localhost` | Endereço do servidor MySQL | `localhost` |
| `DB_PORT` | Não | `3306` | Porta do MySQL | `3306` |
| `DB_USER` | Não | `root` | Usuário do banco | `root` |
| `DB_PASSWORD` | Não | vazio | Senha do usuário do banco | `sua-senha` |
| `DB_NAME` | Não | `biblioteca` | Nome do banco de dados | `biblioteca` |

## Comportamento importante

- Sem `JWT_SECRET`, a aplicação **não inicia**: ela exibe um aviso e encerra.
- Se não conseguir conectar ao MySQL, o servidor também encerra, com uma mensagem pedindo para conferir as variáveis `DB_*` e se o banco foi criado.
- Use um `JWT_SECRET` longo e aleatório fora do ambiente de testes. Nunca publique o seu `.env` nem valores reais.
- Cada pessoa usa a senha do MySQL da própria máquina em `DB_PASSWORD`.

## Frontend

O frontend não usa variáveis de ambiente. A URL da API fica em `public/js/config.js` (`API_BASE`). Vazio significa mesma origem, que é o caso padrão, já que o Express serve o frontend.
