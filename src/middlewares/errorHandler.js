// Permite usar funções async nas rotas sem try/catch em cada uma (Express 4).
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

function errorHandler(err, req, res, next) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Os dados enviados são inválidos.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno. Tente novamente em instantes.' });
}

module.exports = { asyncHandler, errorHandler };
