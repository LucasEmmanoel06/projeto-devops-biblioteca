const { JWT_SECRET } = require('../helpers/setup');
const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarios = require('../../src/repositories/usuarios.repo');
const controller = require('../../src/controllers/auth.controller');
const { criarReq, criarRes } = require('../helpers/http');

const corpoValido = { nome: 'Ana', email: 'ana@exemplo.com', senha: '123456' };

describe('controllers/auth', () => {
  afterEach(() => mock.restoreAll());

  describe('cadastro', () => {
    function stubSucesso() {
      const buscar = mock.method(usuarios, 'buscarPorEmail', async () => undefined);
      const hash = mock.method(bcrypt, 'hash', async () => 'hash-gerado');
      const criar = mock.method(usuarios, 'criar', async ({ nome, email }) => ({ id: 7, nome, email }));
      return { buscar, hash, criar };
    }

    it('retorna 400 quando o nome não é informado', async () => {
      const criar = mock.method(usuarios, 'criar', async () => {});
      const res = criarRes();

      await controller.cadastro(criarReq({ body: { ...corpoValido, nome: '' } }), res);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'Informe seu nome.' });
      assert.equal(criar.mock.callCount(), 0);
    });

    it('retorna 400 quando o nome tem só espaços', async () => {
      const res = criarRes();

      await controller.cadastro(criarReq({ body: { ...corpoValido, nome: '   ' } }), res);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'Informe seu nome.' });
    });

    for (const email of [undefined, '', 'ana', 'ana@', 'ana@exemplo', 'ana @exemplo.com']) {
      it(`retorna 400 para e-mail inválido: ${JSON.stringify(email)}`, async () => {
        const res = criarRes();

        await controller.cadastro(criarReq({ body: { ...corpoValido, email } }), res);

        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.corpo, { erro: 'Informe um e-mail válido.' });
      });
    }

    it('retorna 400 quando a senha tem menos de 6 caracteres', async () => {
      const res = criarRes();

      await controller.cadastro(criarReq({ body: { ...corpoValido, senha: '12345' } }), res);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'A senha precisa ter ao menos 6 caracteres.' });
    });

    it('retorna 400 quando a senha não é enviada', async () => {
      const res = criarRes();

      await controller.cadastro(criarReq({ body: { ...corpoValido, senha: undefined } }), res);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'A senha precisa ter ao menos 6 caracteres.' });
    });

    it('retorna 409 quando o e-mail já está cadastrado', async () => {
      mock.method(usuarios, 'buscarPorEmail', async () => ({ id: 1 }));
      const criar = mock.method(usuarios, 'criar', async () => {});
      const res = criarRes();

      await controller.cadastro(criarReq({ body: corpoValido }), res);

      assert.equal(res.statusCode, 409);
      assert.deepEqual(res.corpo, { erro: 'Este e-mail já está cadastrado.' });
      assert.equal(criar.mock.callCount(), 0);
    });

    it('normaliza nome e e-mail antes de consultar e salvar', async () => {
      const { buscar, criar } = stubSucesso();

      await controller.cadastro(
        criarReq({ body: { nome: '  Ana  ', email: '  ANA@Exemplo.COM ', senha: '123456' } }),
        criarRes()
      );

      assert.deepEqual(buscar.mock.calls[0].arguments, ['ana@exemplo.com']);
      assert.deepEqual(criar.mock.calls[0].arguments, [
        { nome: 'Ana', email: 'ana@exemplo.com', senhaHash: 'hash-gerado' },
      ]);
    });

    it('gera o hash da senha com custo 10', async () => {
      const { hash } = stubSucesso();

      await controller.cadastro(criarReq({ body: corpoValido }), criarRes());

      assert.deepEqual(hash.mock.calls[0].arguments, ['123456', 10]);
    });

    it('retorna 201 com o usuário e um token válido', async () => {
      stubSucesso();
      const res = criarRes();

      await controller.cadastro(criarReq({ body: corpoValido }), res);

      assert.equal(res.statusCode, 201);
      assert.deepEqual(res.corpo.usuario, { id: 7, nome: 'Ana', email: 'ana@exemplo.com' });
      const payload = jwt.verify(res.corpo.token, JWT_SECRET);
      assert.equal(payload.sub, '7');
      assert.equal(payload.nome, 'Ana');
      assert.equal(payload.exp - payload.iat, 7 * 24 * 60 * 60);
    });

    it('propaga erros do repositório', async () => {
      mock.method(usuarios, 'buscarPorEmail', async () => { throw new Error('db fora'); });

      await assert.rejects(controller.cadastro(criarReq({ body: corpoValido }), criarRes()), /db fora/);
    });
  });

  describe('login', () => {
    const registro = { id: 3, nome: 'Ana', email: 'ana@exemplo.com', senha_hash: 'hash-salvo' };

    it('retorna 401 quando o usuário não existe', async () => {
      mock.method(usuarios, 'buscarPorEmail', async () => undefined);
      const compare = mock.method(bcrypt, 'compare', async () => true);
      const res = criarRes();

      await controller.login(criarReq({ body: { email: 'x@y.com', senha: '123456' } }), res);

      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.corpo, { erro: 'E-mail ou senha incorretos.' });
      assert.equal(compare.mock.callCount(), 0);
    });

    it('retorna 401 quando a senha não confere', async () => {
      mock.method(usuarios, 'buscarPorEmail', async () => registro);
      mock.method(bcrypt, 'compare', async () => false);
      const res = criarRes();

      await controller.login(criarReq({ body: { email: 'ana@exemplo.com', senha: 'errada' } }), res);

      assert.equal(res.statusCode, 401);
      assert.deepEqual(res.corpo, { erro: 'E-mail ou senha incorretos.' });
    });

    it('normaliza o e-mail e compara a senha com o hash salvo', async () => {
      const buscar = mock.method(usuarios, 'buscarPorEmail', async () => registro);
      const compare = mock.method(bcrypt, 'compare', async () => true);

      await controller.login(criarReq({ body: { email: ' ANA@exemplo.com ', senha: '123456' } }), criarRes());

      assert.deepEqual(buscar.mock.calls[0].arguments, ['ana@exemplo.com']);
      assert.deepEqual(compare.mock.calls[0].arguments, ['123456', 'hash-salvo']);
    });

    it('trata corpo sem e-mail e senha como strings vazias', async () => {
      const buscar = mock.method(usuarios, 'buscarPorEmail', async () => undefined);
      const res = criarRes();

      await controller.login(criarReq({ body: {} }), res);

      assert.deepEqual(buscar.mock.calls[0].arguments, ['']);
      assert.equal(res.statusCode, 401);
    });

    it('retorna 200 com token e usuário sem o hash da senha', async () => {
      mock.method(usuarios, 'buscarPorEmail', async () => registro);
      mock.method(bcrypt, 'compare', async () => true);
      const res = criarRes();

      await controller.login(criarReq({ body: { email: 'ana@exemplo.com', senha: '123456' } }), res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.corpo.usuario, { id: 3, nome: 'Ana', email: 'ana@exemplo.com' });
      const payload = jwt.verify(res.corpo.token, JWT_SECRET);
      assert.equal(payload.sub, '3');
      assert.equal(payload.nome, 'Ana');
    });
  });
});
