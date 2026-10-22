const { test } = require("node:test");
const assert = require("node:assert/strict");

const PORT = process.env.PORT || "3000";
const email = `smoke_${Date.now()}@teste.com`;
const senha = "Smoke1234";

const JSON_HEADERS = { "Content-Type": "application/json" };

const req = (path, opts = {}) =>
  fetch(`http://localhost:${PORT}` + path, { signal: AbortSignal.timeout(10_000), ...opts });

const post = (path, body, headers = {}) =>
  req(path, {
    method: "POST",
    headers: { ...JSON_HEADERS, ...headers },
    body: JSON.stringify(body),
  });

test("Teste de Smoke - deve mostrar página de login", async () => {
  assert.equal((await req("/")).status, 200, "/index.html deveria retornar status 200");
});

test("Teste de Smoke - deve mostrar página de cadastro", async () => {
  assert.equal(
    (await req("/cadastro.html")).status,
    200,
    "/cadastro.html deveria retornar status 200",
  );
});

test("Teste de Smoke - api do app biblioteca deve estar saudável", async () => {
  assert.equal((await req("/health")).status, 200);
});

test("Teste de Smoke - fluxo completo: cadastro, login e CRUD de livro", async (t) => {
  let auth;
  let id;

  await t.test("Cadastro de usuário", async () => {
    const res = await post("/api/auth/cadastro", { nome: "Smoke", email, senha });
    assert.equal(res.status, 201, `cadastro falhou - status ${res.status}`);
  });

  await t.test("Login de usuário e obtenção de token", async () => {
    const res = await post("/api/auth/login", { email, senha });
    assert.equal(res.status, 200, `login falhou - status ${res.status}`);
    const data = await res.json();
    assert.ok(data.token, "login deve retornar token");
    auth = { Authorization: `Bearer ${data.token}` };
  });

  await t.test("Acesso à página biblioteca.html autenticada", async () => {
    assert.equal(
      (await req("/biblioteca.html", { headers: auth })).status,
      200,
      "/biblioteca.html deveria retornar status 200",
    );
  });

  await t.test("Criação de livro", async () => {
    const res = await post(
      "/api/livros",
      { titulo: "Os Irmãos Karamázov", autor: "Fiódor Dostoiévski" },
      auth,
    );
    assert.equal(res.status, 201, `create falhou - status ${res.status}`);
    const data = await res.json();
    id = data.id;
    assert.ok(id, "create de livro deve retornar id");
  });

  await t.test("Listagem de livros", async () => {
    const lista = await (await req("/api/livros", { headers: auth })).json();
    assert.ok(
      lista.some((livro) => livro.id === id),
      "livro deve aparecer na listagem",
    );
  });

  await t.test("Edição de livro", async () => {
    const res = await req(`/api/livros/${id}`, {
      method: "PUT",
      headers: { ...JSON_HEADERS, ...auth },
      body: JSON.stringify({
        titulo: "Os Irmãos Karamázov (editado)",
        autor: "Fiódor Dostoiévski",
      }),
    });
    assert.equal(res.status, 200, `update falhou - status ${res.status}`);
    const [atual] = await (await req(`/api/livros`, { headers: auth })).json();
    assert.equal(atual.titulo, "Os Irmãos Karamázov (editado)", "update não persistiu");
  });

  await t.test("Exclusão de livro", async () => {
    const res = await req(`/api/livros/${id}`, { method: "DELETE", headers: auth });
    assert.ok([200, 204].includes(res.status), `delete retornou ${res.status}`);
  });
});
