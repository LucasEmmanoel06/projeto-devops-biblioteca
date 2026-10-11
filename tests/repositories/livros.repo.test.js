require('../helpers/setup');
const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../../src/db/database');
const livrosRepo = require('../../src/repositories/livros.repo');

// Normaliza espaços para comparar o SQL sem depender da indentação.
const sql = (texto) => texto.replace(/\s+/g, ' ').trim();

describe('repositories/livros', () => {
  afterEach(() => mock.restoreAll());

  describe('criarLivro', () => {
    it('insere o livro com parâmetros e retorna os dados com o id gerado', async () => {
      const execute = mock.method(db, 'execute', async () => [{ insertId: 20 }]);
      const dados = { titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: 1899, usuarioId: 5 };

      const livro = await livrosRepo.criarLivro(dados);

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'INSERT INTO livros (titulo, autor, ano, usuario_id) VALUES (?, ?, ?, ?)');
      assert.deepEqual(params, ['Dom Casmurro', 'Machado de Assis', 1899, 5]);
      assert.deepEqual(livro, { id: 20, ...dados });
    });

    it('aceita ano null', async () => {
      const execute = mock.method(db, 'execute', async () => [{ insertId: 21 }]);

      const livro = await livrosRepo.criarLivro({ titulo: 'T', autor: 'A', ano: null, usuarioId: 5 });

      assert.equal(execute.mock.calls[0].arguments[1][2], null);
      assert.equal(livro.ano, null);
    });
  });

  describe('buscarLivros', () => {
    it('filtra pelo usuário e retorna as linhas', async () => {
      const linhas = [{ id: 1 }, { id: 2 }];
      const execute = mock.method(db, 'execute', async () => [linhas]);

      const resultado = await livrosRepo.buscarLivros(5);

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'SELECT * FROM livros WHERE usuario_id = ?');
      assert.deepEqual(params, [5]);
      assert.equal(resultado, linhas);
    });
  });

  describe('buscarLivro', () => {
    it('busca por título ou autor com LIKE, restrito ao usuário', async () => {
      const linhas = [{ id: 3 }];
      const execute = mock.method(db, 'execute', async () => [linhas]);

      const resultado = await livrosRepo.buscarLivro('Machado', 5);

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'SELECT * FROM livros WHERE (titulo LIKE ? OR autor LIKE ?) AND usuario_id = ?');
      assert.deepEqual(params, ['%Machado%', '%Machado%', 5]);
      assert.equal(resultado, linhas);
    });

    // Comportamento atual: % e _ do termo não são escapados e funcionam como curingas.
    it('repassa curingas do termo sem escapar', async () => {
      const execute = mock.method(db, 'execute', async () => [[]]);

      await livrosRepo.buscarLivro('100%_', 5);

      assert.deepEqual(execute.mock.calls[0].arguments[1], ['%100%_%', '%100%_%', 5]);
    });
  });

  describe('editarLivro', () => {
    const dados = { titulo: 'T', autor: 'A', ano: 2000, id: 9, usuarioId: 5 };

    it('atualiza pelo id e usuário com parâmetros', async () => {
      const execute = mock.method(db, 'execute', async () => [{ affectedRows: 1 }]);

      await livrosRepo.editarLivro(dados);

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'UPDATE livros SET titulo = ?, autor = ?, ano = ? WHERE id = ? AND usuario_id = ?');
      assert.deepEqual(params, ['T', 'A', 2000, 9, 5]);
    });

    it('retorna true quando alguma linha foi afetada', async () => {
      mock.method(db, 'execute', async () => [{ affectedRows: 1 }]);

      assert.equal(await livrosRepo.editarLivro(dados), true);
    });

    it('retorna false quando nenhuma linha foi afetada', async () => {
      mock.method(db, 'execute', async () => [{ affectedRows: 0 }]);

      assert.equal(await livrosRepo.editarLivro(dados), false);
    });
  });

  describe('deletarLivro', () => {
    it('exclui pelo id e usuário com parâmetros', async () => {
      const execute = mock.method(db, 'execute', async () => [{ affectedRows: 1 }]);

      await livrosRepo.deletarLivro(9, 5);

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'DELETE FROM livros WHERE id = ? AND usuario_id = ?');
      assert.deepEqual(params, [9, 5]);
    });

    it('retorna true quando alguma linha foi afetada', async () => {
      mock.method(db, 'execute', async () => [{ affectedRows: 1 }]);

      assert.equal(await livrosRepo.deletarLivro(9, 5), true);
    });

    it('retorna false quando nenhuma linha foi afetada', async () => {
      mock.method(db, 'execute', async () => [{ affectedRows: 0 }]);

      assert.equal(await livrosRepo.deletarLivro(9, 5), false);
    });

    it('propaga erros do banco', async () => {
      mock.method(db, 'execute', async () => { throw new Error('db fora'); });

      await assert.rejects(livrosRepo.deletarLivro(9, 5), /db fora/);
    });
  });
});
