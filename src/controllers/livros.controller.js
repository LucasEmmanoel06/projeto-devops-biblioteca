const livrosRepo = require('../repositories/livros.repo');

// valida campos e aceita parametros vazios para validação
function validarLivro({ titulo, autor, ano } = {}) {
  titulo = typeof titulo === 'string' ? titulo.trim() : '';
  autor = typeof autor === 'string' ? autor.trim() : '';

  if (!titulo || !autor) {
    return { erro: 'Título e autor são obrigatórios.' };
  }

  if (titulo.length > 200 || autor.length > 150) {
    return { erro: 'O título ou o nome do autor excede o limite de caracteres.' };
}
 // transformar o ano em number
  ano = ano === '' || ano == null ? null : Number(ano);

 // validar ano e limitar ao ano atual
  if ( ano !== null &&
    (!Number.isInteger(ano) || ano < 1 || ano > new Date().getFullYear())
  ) {
    return { erro: 'Informe um ano válido.' };
  }

  return { dados: { titulo, autor, ano } };
}

async function criar(req, res) {
  const validacao = validarLivro(req.body || {});

  if (validacao.erro) {
    return res.status(400).json({ erro: validacao.erro });
  }

  const livro = await livrosRepo.criarLivro({
    ...validacao.dados,
    usuarioId: req.usuario.id
  });

  return res.status(201).json(livro);
}

async function listar(req, res) {
  const usuarioId = req.usuario.id;
  const termo = String(req.query.busca || '').trim();

  const livros = termo
    ? await livrosRepo.buscarLivro(termo, usuarioId)
    : await livrosRepo.buscarLivros(usuarioId);

  return res.status(200).json(livros);
}

async function editar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const validacao = validarLivro(req.body || {});

  if (validacao.erro) {
    return res.status(400).json({ erro: validacao.erro });
  }

  const atualizado = await livrosRepo.editarLivro({
    ...validacao.dados,
    id,
    usuarioId: req.usuario.id
  });

  if (!atualizado) {
    return res.status(404).json({ erro: 'Livro não encontrado.' });
  }

  return res.status(200).json({
    mensagem: 'Livro atualizado com sucesso.'
  });
}

async function deletar(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }

  const deletado = await livrosRepo.deletarLivro(id, req.usuario.id);

  if (!deletado) {
    return res.status(404).json({ erro: 'Livro não encontrado.' });
  }

  return res.status(200).json({
    mensagem: 'Livro excluído com sucesso.'
  });
}

module.exports = { criar, listar, editar, deletar };
