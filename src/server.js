const { PORT } = require('./config/env');
const db = require('./db/database');
const app = require('./app');

async function iniciar() {
  try {
    await db.query('SELECT 1');
  } catch (e) {
    console.error('Não foi possível conectar ao MySQL:', e.message);
    console.error('Confira os dados DB_* no .env e se o banco foi criado (src/db/schema.sql).');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Biblioteca rodando em http://localhost:${PORT}`);
  });
}

iniciar();
