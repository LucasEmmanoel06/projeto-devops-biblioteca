require('../helpers/setup');
const { describe, it, mock, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const livrosRepo = require('../../src/repositories/livros.repo');
const controller = require('../../src/controllers/livros.controller');
const { criarReq, criarRes } = require('../helpers/http');

const usuario = { id: 5, nome: 'Ana' };
const livroValido = { titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: 1899 };
const anoAtual = new Date().getFullYear();

describe('controllers/livros', () => {
  afterEach(() => mock.restoreAll());

  // validarLivro não é exportado: as regras são testadas por meio de criar.
  describe('validação do livro (via criar)', () => {
    async function criarCom(body) {
      const repo = mock.method(livrosRepo, 'criarLivro', async (dados) => ({ id: 1, ...dados }));
      const res = criarRes();
      await controller.criar(criarReq({ body, usuario }), res);
      return { res, repo };
    }

    const casosInvalidos = [
      ['sem título', { autor: 'Autor' }, 'Título e autor são obrigatórios.'],
      ['sem autor', { titulo: 'Título' }, 'Título e autor são obrigatórios.'],
      ['título só com espaços', { titulo: '   ', autor: 'Autor' }, 'Título e autor são obrigatórios.'],
      ['título numérico', { titulo: 123, autor: 'Autor' }, 'Título e autor são obrigatórios.'],
      ['título com 201 caracteres', { titulo: 'a'.repeat(201), autor: 'Autor' },
        'O título ou o nome do autor excede o limite de caracteres.'],
      ['autor com 151 caracteres', { titulo: 'Título', autor: 'a'.repeat(151) },
        'O título ou o nome do autor excede o limite de caracteres.'],
      ['ano zero', { ...livroValido, ano: 0 }, 'Informe um ano válido.'],
      ['ano negativo', { ...livroValido, ano: -10 }, 'Informe um ano válido.'],
      ['ano decimal', { ...livroValido, ano: 1999.5 }, 'Informe um ano válido.'],
      ['ano não numérico', { ...livroValido, ano: 'abc' }, 'Informe um ano válido.'],
      ['ano só com espaços', { ...livroValido, ano: '   ' }, 'Informe um ano válido.'],
      ['ano no futuro', { ...livroValido, ano: anoAtual + 1 }, 'Informe um ano válido.'],
    ];

    for (const [descricao, body, erro] of casosInvalidos) {
      it(`retorna 400 para ${descricao}`, async () => {
        const { res, repo } = await criarCom(body);

        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.corpo, { erro });
        assert.equal(repo.mock.callCount(), 0);
      });
    }

    it('retorna 400 quando não há corpo', async () => {
      const { res } = await criarCom(undefined);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'Título e autor são obrigatórios.' });
    });

    it('aceita título com 200 e autor com 150 caracteres', async () => {
      const { res } = await criarCom({ titulo: 'a'.repeat(200), autor: 'b'.repeat(150) });

      assert.equal(res.statusCode, 201);
    });

    it('remove espaços do título e do autor', async () => {
      const { repo } = await criarCom({ titulo: '  Título  ', autor: ' Autor ' });

      assert.equal(repo.mock.calls[0].arguments[0].titulo, 'Título');
      assert.equal(repo.mock.calls[0].arguments[0].autor, 'Autor');
    });

    for (const ano of [undefined, null, '']) {
      it(`converte ano ${JSON.stringify(ano)} em null`, async () => {
        const { res, repo } = await criarCom({ titulo: 'Título', autor: 'Autor', ano });

        assert.equal(res.statusCode, 201);
        assert.equal(repo.mock.calls[0].arguments[0].ano, null);
      });
    }

    it('converte ano em texto para número', async () => {
      const { repo } = await criarCom({ ...livroValido, ano: '1899' });

      assert.equal(repo.mock.calls[0].arguments[0].ano, 1899);
    });

    it('aceita o ano atual e o ano 1', async () => {
      assert.equal((await criarCom({ ...livroValido, ano: anoAtual })).res.statusCode, 201);
      mock.restoreAll();
      assert.equal((await criarCom({ ...livroValido, ano: 1 })).res.statusCode, 201);
    });

    // Comportamento atual: Number(true) === 1, então true passa como ano válido.
    it('aceita ano booleano true como ano 1', async () => {
      const { res, repo } = await criarCom({ ...livroValido, ano: true });

      assert.equal(res.statusCode, 201);
      assert.equal(repo.mock.calls[0].arguments[0].ano, 1);
    });
  });

  describe('criar', () => {
    it('salva o livro com o usuário autenticado e retorna 201', async () => {
      const repo = mock.method(livrosRepo, 'criarLivro', async (dados) => ({ id: 10, ...dados }));
      const res = criarRes();

      await controller.criar(criarReq({ body: { ...livroValido, extra: 'ignorado' }, usuario }), res);

      assert.deepEqual(repo.mock.calls[0].arguments, [{ ...livroValido, usuarioId: 5 }]);
      assert.equal(res.statusCode, 201);
      assert.deepEqual(res.corpo, { id: 10, ...livroValido, usuarioId: 5 });
    });

    it('propaga erros do repositório', async () => {
      mock.method(livrosRepo, 'criarLivro', async () => { throw new Error('db fora'); });

      await assert.rejects(controller.criar(criarReq({ body: livroValido, usuario }), criarRes()), /db fora/);
    });
  });

  describe('listar', () => {
    it('lista todos os livros do usuário quando não há busca', async () => {
      const livros = [{ id: 1 }, { id: 2 }];
      const todos = mock.method(livrosRepo, 'buscarLivros', async () => livros);
      const busca = mock.method(livrosRepo, 'buscarLivro', async () => []);
      const res = criarRes();

      await controller.listar(criarReq({ usuario }), res);

      assert.deepEqual(todos.mock.calls[0].arguments, [5]);
      assert.equal(busca.mock.callCount(), 0);
      assert.equal(res.statusCode, 200);
      assert.equal(res.corpo, livros);
    });

    it('trata busca só com espaços como ausência de busca', async () => {
      const todos = mock.method(livrosRepo, 'buscarLivros', async () => []);
      const busca = mock.method(livrosRepo, 'buscarLivro', async () => []);

      await controller.listar(criarReq({ query: { busca: '   ' }, usuario }), criarRes());

      assert.equal(todos.mock.callCount(), 1);
      assert.equal(busca.mock.callCount(), 0);
    });

    it('busca pelo termo sem espaços nas pontas', async () => {
      const livros = [{ id: 3 }];
      const todos = mock.method(livrosRepo, 'buscarLivros', async () => []);
      const busca = mock.method(livrosRepo, 'buscarLivro', async () => livros);
      const res = criarRes();

      await controller.listar(criarReq({ query: { busca: '  Machado ' }, usuario }), res);

      assert.deepEqual(busca.mock.calls[0].arguments, ['Machado', 5]);
      assert.equal(todos.mock.callCount(), 0);
      assert.equal(res.statusCode, 200);
      assert.equal(res.corpo, livros);
    });
  });

  describe('editar', () => {
    for (const id of ['abc', '0', '-1', '1.5']) {
      it(`retorna 400 para ID inválido: ${id}`, async () => {
        const repo = mock.method(livrosRepo, 'editarLivro', async () => true);
        const res = criarRes();

        await controller.editar(criarReq({ params: { id }, body: livroValido, usuario }), res);

        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.corpo, { erro: 'ID inválido.' });
        assert.equal(repo.mock.callCount(), 0);
      });
    }

    it('retorna 400 quando os dados do livro são inválidos', async () => {
      const repo = mock.method(livrosRepo, 'editarLivro', async () => true);
      const res = criarRes();

      await controller.editar(criarReq({ params: { id: '1' }, body: { titulo: 'Só título' }, usuario }), res);

      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.corpo, { erro: 'Título e autor são obrigatórios.' });
      assert.equal(repo.mock.callCount(), 0);
    });

    it('retorna 404 quando o livro não existe ou é de outro usuário', async () => {
      mock.method(livrosRepo, 'editarLivro', async () => false);
      const res = criarRes();

      await controller.editar(criarReq({ params: { id: '9' }, body: livroValido, usuario }), res);

      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.corpo, { erro: 'Livro não encontrado.' });
    });

    it('atualiza o livro e retorna 200', async () => {
      const repo = mock.method(livrosRepo, 'editarLivro', async () => true);
      const res = criarRes();

      await controller.editar(criarReq({ params: { id: '9' }, body: livroValido, usuario }), res);

      assert.deepEqual(repo.mock.calls[0].arguments, [{ ...livroValido, id: 9, usuarioId: 5 }]);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.corpo, { mensagem: 'Livro atualizado com sucesso.' });
    });
  });

  describe('deletar', () => {
    for (const id of ['abc', '0', '-1', '1.5']) {
      it(`retorna 400 para ID inválido: ${id}`, async () => {
        const repo = mock.method(livrosRepo, 'deletarLivro', async () => true);
        const res = criarRes();

        await controller.deletar(criarReq({ params: { id }, usuario }), res);

        assert.equal(res.statusCode, 400);
        assert.deepEqual(res.corpo, { erro: 'ID inválido.' });
        assert.equal(repo.mock.callCount(), 0);
      });
    }

    it('retorna 404 quando o livro não existe ou é de outro usuário', async () => {
      mock.method(livrosRepo, 'deletarLivro', async () => false);
      const res = criarRes();

      await controller.deletar(criarReq({ params: { id: '9' }, usuario }), res);

      assert.equal(res.statusCode, 404);
      assert.deepEqual(res.corpo, { erro: 'Livro não encontrado.' });
    });

    it('exclui o livro e retorna 200', async () => {
      const repo = mock.method(livrosRepo, 'deletarLivro', async () => true);
      const res = criarRes();

      await controller.deletar(criarReq({ params: { id: '9' }, usuario }), res);

      assert.deepEqual(repo.mock.calls[0].arguments, [9, 5]);
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.corpo, { mensagem: 'Livro excluído com sucesso.' });
    });
  });
});
