const db = require('../db/database');

async function buscarPorEmail(email) {
  const [linhas] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return linhas[0];
}

async function criar({ nome, email, senhaHash }) {
  const [resultado] = await db.execute(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
    [nome, email, senhaHash]
  );
  return { id: resultado.insertId, nome, email };
}

module.exports = { buscarPorEmail, criar };
