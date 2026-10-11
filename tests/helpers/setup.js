// Carregar antes de qualquer módulo de src/: o env.js encerra o processo sem JWT_SECRET.
process.env.JWT_SECRET = 'segredo-de-teste';

module.exports = { JWT_SECRET: process.env.JWT_SECRET };
