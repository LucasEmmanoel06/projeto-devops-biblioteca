// req/res falsos para chamar controllers e middlewares sem subir o Express.
function criarReq({ body = {}, params = {}, query = {}, headers = {}, usuario } = {}) {
  return { body, params, query, headers, usuario };
}

function criarRes() {
  const res = {
    statusCode: 200,
    corpo: undefined,
    status(codigo) {
      res.statusCode = codigo;
      return res;
    },
    json(dados) {
      res.corpo = dados;
      return res;
    },
  };
  return res;
}

module.exports = { criarReq, criarRes };
