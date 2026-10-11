const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const ENV_PATH = path.resolve(__dirname, '../../src/config/env.js');

// Roda o env.js em outro processo, fora da raiz do projeto, para que o dotenv
// não leia um .env local e o process.exit não derrube o runner.
function carregarEnv(variaveis) {
  const script = `console.log(JSON.stringify(require(${JSON.stringify(ENV_PATH)})))`;
  return spawnSync(process.execPath, ['-e', script], {
    cwd: os.tmpdir(),
    env: { PATH: process.env.PATH, ...variaveis },
    encoding: 'utf8',
  });
}

describe('config/env', () => {
  it('encerra com código 1 quando JWT_SECRET não está definido', () => {
    const resultado = carregarEnv({});

    assert.equal(resultado.status, 1);
    assert.match(resultado.stderr, /Defina JWT_SECRET/);
  });

  it('usa valores padrão quando só JWT_SECRET está definido', () => {
    const resultado = carregarEnv({ JWT_SECRET: 'abc' });

    assert.equal(resultado.status, 0, resultado.stderr);
    assert.deepEqual(JSON.parse(resultado.stdout), {
      PORT: 3000,
      JWT_SECRET: 'abc',
      DB: { host: 'localhost', port: 3306, user: 'root', password: '', name: 'biblioteca' },
    });
  });

  it('lê os valores das variáveis de ambiente', () => {
    const resultado = carregarEnv({
      JWT_SECRET: 'abc',
      PORT: '8080',
      DB_HOST: 'db',
      DB_PORT: '3307',
      DB_USER: 'app',
      DB_PASSWORD: 'senha',
      DB_NAME: 'acervo',
    });

    assert.equal(resultado.status, 0, resultado.stderr);
    assert.deepEqual(JSON.parse(resultado.stdout), {
      PORT: '8080',
      JWT_SECRET: 'abc',
      DB: { host: 'db', port: 3307, user: 'app', password: 'senha', name: 'acervo' },
    });
  });

  it('usa a porta padrão do banco quando DB_PORT não é numérico', () => {
    const resultado = carregarEnv({ JWT_SECRET: 'abc', DB_PORT: 'abc' });

    assert.equal(JSON.parse(resultado.stdout).DB.port, 3306);
  });
});
