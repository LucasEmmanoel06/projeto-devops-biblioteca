require('../helpers/setup');
const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../../src/db/database');
const usuarios = require('../../src/repositories/usuarios.repo');

// Normaliza espaços para comparar o SQL sem depender da indentação.
const sql = (texto) => texto.replace(/\s+/g, ' ').trim();

describe('repositories/usuarios', () => {
  afterEach(() => mock.restoreAll());

  describe('buscarPorEmail', () => {
    it('consulta pelo e-mail com parâmetro', async () => {
      const execute = mock.method(db, 'execute', async () => [[]]);

      await usuarios.buscarPorEmail('ana@exemplo.com');

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'SELECT * FROM usuarios WHERE email = ?');
      assert.deepEqual(params, ['ana@exemplo.com']);
    });

    it('retorna o primeiro registro encontrado', async () => {
      const registro = { id: 1, email: 'ana@exemplo.com' };
      mock.method(db, 'execute', async () => [[registro]]);

      assert.equal(await usuarios.buscarPorEmail('ana@exemplo.com'), registro);
    });

    it('retorna undefined quando não encontra', async () => {
      mock.method(db, 'execute', async () => [[]]);

      assert.equal(await usuarios.buscarPorEmail('x@y.com'), undefined);
    });
  });

  describe('criar', () => {
    it('insere o usuário com parâmetros e retorna sem o hash', async () => {
      const execute = mock.method(db, 'execute', async () => [{ insertId: 12 }]);

      const usuario = await usuarios.criar({ nome: 'Ana', email: 'ana@exemplo.com', senhaHash: 'hash' });

      const [query, params] = execute.mock.calls[0].arguments;
      assert.equal(sql(query), 'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)');
      assert.deepEqual(params, ['Ana', 'ana@exemplo.com', 'hash']);
      assert.deepEqual(usuario, { id: 12, nome: 'Ana', email: 'ana@exemplo.com' });
    });

    it('propaga erros do banco', async () => {
      mock.method(db, 'execute', async () => { throw Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' }); });

      await assert.rejects(usuarios.criar({ nome: 'Ana', email: 'a@b.com', senhaHash: 'h' }), { code: 'ER_DUP_ENTRY' });
    });
  });
});
