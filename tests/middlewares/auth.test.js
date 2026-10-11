const { JWT_SECRET } = require('../helpers/setup');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const auth = require('../../src/middlewares/auth');
const { criarReq, criarRes } = require('../helpers/http');

function executar(authorization) {
  const req = criarReq({ headers: authorization === undefined ? {} : { authorization } });
  const res = criarRes();
  let chamouNext = false;
  auth(req, res, () => { chamouNext = true; });
  return { req, res, chamouNext };
}

describe('middlewares/auth', () => {
  it('retorna 401 quando o header Authorization não é enviado', () => {
    const { res, chamouNext } = executar();

    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.corpo, { erro: 'Entre na sua conta para continuar.' });
  });

  it('retorna 401 quando o tipo não é Bearer', () => {
    const token = jwt.sign({ nome: 'Ana' }, JWT_SECRET, { subject: '1' });
    const { res, chamouNext } = executar(`Basic ${token}`);

    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.corpo, { erro: 'Entre na sua conta para continuar.' });
  });

  it('retorna 401 quando o token está ausente após Bearer', () => {
    const { res, chamouNext } = executar('Bearer');

    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.corpo, { erro: 'Entre na sua conta para continuar.' });
  });

  it('retorna 401 de sessão expirada quando o token é inválido', () => {
    const { res, chamouNext } = executar('Bearer token-invalido');

    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.corpo, { erro: 'Sua sessão expirou. Entre novamente.' });
  });

  it('retorna 401 de sessão expirada quando o token foi assinado com outro segredo', () => {
    const token = jwt.sign({ nome: 'Ana' }, 'outro-segredo', { subject: '1' });
    const { res, chamouNext } = executar(`Bearer ${token}`);

    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.corpo, { erro: 'Sua sessão expirou. Entre novamente.' });
  });

  it('retorna 401 de sessão expirada quando o token expirou', () => {
    const token = jwt.sign({ nome: 'Ana', exp: Math.floor(Date.now() / 1000) - 60 }, JWT_SECRET, {
      subject: '1',
    });
    const { res, chamouNext } = executar(`Bearer ${token}`);

    assert.equal(chamouNext, false);
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.corpo, { erro: 'Sua sessão expirou. Entre novamente.' });
  });

  it('preenche req.usuario e chama next quando o token é válido', () => {
    const token = jwt.sign({ nome: 'Ana' }, JWT_SECRET, { subject: '42' });
    const { req, res, chamouNext } = executar(`Bearer ${token}`);

    assert.equal(chamouNext, true);
    assert.equal(res.corpo, undefined);
    assert.deepEqual(req.usuario, { id: 42, nome: 'Ana' });
  });

  // Comportamento atual: um sub não numérico não é rejeitado e vira NaN.
  it('aceita token com sub não numérico, gerando id NaN', () => {
    const token = jwt.sign({ nome: 'Ana' }, JWT_SECRET, { subject: 'abc' });
    const { req, chamouNext } = executar(`Bearer ${token}`);

    assert.equal(chamouNext, true);
    assert.ok(Number.isNaN(req.usuario.id));
  });
});
