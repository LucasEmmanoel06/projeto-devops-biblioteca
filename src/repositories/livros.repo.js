const db = require('../db/database');

async function criarLivro({ titulo, autor, ano, usuarioId }) {
  const [resultado] = await db.execute(
    `INSERT INTO livros (titulo, autor, ano, usuario_id)
     VALUES (?, ?, ?, ?)`,
    [titulo, autor, ano, usuarioId]
  );

  return {
    id: resultado.insertId,
    titulo,
    autor,
    ano,
    usuarioId
  };
}

async function buscarLivros(usuarioId) {
  const [linhas] = await db.execute(
    'SELECT * FROM livros WHERE usuario_id = ?',
    [usuarioId]
  );

  return linhas;
}


async function buscarLivro(termo, usuarioId) {
  const [linhas] = await db.execute(
    `SELECT * FROM livros
     WHERE (titulo LIKE ? OR autor LIKE ?)
     AND usuario_id = ?`,
    [`%${termo}%`, `%${termo}%`, usuarioId]
  );

  return linhas;
}


async function editarLivro({ titulo, autor, ano, id, usuarioId }) {
  const [resultado] = await db.execute(
    `UPDATE livros
     SET titulo = ?, autor = ?, ano = ?
     WHERE id = ? AND usuario_id = ?`,
    [titulo, autor, ano, id, usuarioId]
  );

  return resultado.affectedRows > 0;
}

async function deletarLivro(id, usuarioId) {
  const [resultado] = await db.execute(
    'DELETE FROM livros WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );

  return resultado.affectedRows > 0;
}

module.exports = {
  criarLivro,
  buscarLivros,
  buscarLivro,
  editarLivro,
  deletarLivro
};

