const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { asyncHandler, errorHandler } = require('../../src/middlewares/errorHandler');
const { criarReq, criarRes } = require('../helpers/http');

describe('middlewares/errorHandler', () => {
  describe('asyncHandler', () => {
    it('repassa req, res e next para a função', async () => {
      const req = criarReq();
      const res = criarRes();
      const next = () => {};
      let recebidos;

      await asyncHandler(async (...args) => { recebidos = args; })(req, res, next);

      assert.deepEqual(recebidos, [req, res, next]);
    });

    it('não chama next quando a função resolve', async () => {
      let chamadasNext = 0;

      await asyncHandler(async () => {})(criarReq(), criarRes(), () => { chamadasNext++; });

      assert.equal(chamadasNext, 0);
    });

    it('chama next com o erro quando a função rejeita', async () => {
      const erro = new Error('falhou');
      let recebido;

      await asyncHandler(async () => { throw erro; })(criarReq(), criarRes(), (e) => { recebido = e; });

      assert.equal(recebido, erro);
    });

    it('aceita funções síncronas', async () => {
      let chamou = false;

      await asyncHandler(() => { chamou = true; })(criarReq(), criarRes(), () => {});

      assert.equal(chamou, true);
    });
  });

  describe('errorHandler', () => {
    afterEach(() => mock.restoreAll());

    it('retorna 409 para ER_DUP_ENTRY', () => {
      const res = criarRes();

      errorHandler({ code: 'ER_DUP_ENTRY' }, criarReq(), res, () => {});

      assert.equal(res.statusCode, 409);
      assert.deepEqual(res.corpo, { erro: 'Este e-mail já está cadastrado.' });
    });

    it('retorna 400 para JSON malformado (entity.parse.failed)', () => {
      const res = criarRes();

      errorHandler({ type: 'entity.parse.failed' }, criarReq(), res, () => {});

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'Os dados enviados são inválidos.' });
    });

    it('retorna 500 e registra o erro no console para erros desconhecidos', () => {
      const consoleError = mock.method(console, 'error', () => {});
      const erro = new Error('inesperado');
      const res = criarRes();

      errorHandler(erro, criarReq(), res, () => {});

      assert.equal(res.statusCode, 500);
      assert.deepEqual(res.corpo, { erro: 'Erro interno. Tente novamente em instantes.' });
      assert.equal(consoleError.mock.callCount(), 1);
      assert.deepEqual(consoleError.mock.calls[0].arguments, [erro]);
    });

    it('não registra no console os erros tratados', () => {
      const consoleError = mock.method(console, 'error', () => {});

      errorHandler({ code: 'ER_DUP_ENTRY' }, criarReq(), criarRes(), () => {});
      errorHandler({ type: 'entity.parse.failed' }, criarReq(), criarRes(), () => {});

      assert.equal(consoleError.mock.callCount(), 0);
    });
  });
});
