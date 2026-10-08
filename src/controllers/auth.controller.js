const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const usuarios = require('../repositories/usuarios.repo');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function gerarToken(usuario) {
  return jwt.sign({ nome: usuario.nome }, JWT_SECRET, {
    subject: String(usuario.id),
    expiresIn: '7d',
  });
}

async function cadastro(req, res) {
  const nome = String(req.body.nome || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  if (!nome) return res.status(400).json({ erro: 'Informe seu nome.' });
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ erro: 'Informe um e-mail válido.' });
  if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter ao menos 6 caracteres.' });

  if (await usuarios.buscarPorEmail(email)) {
    return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await usuarios.criar({ nome, email, senhaHash });
  res.status(201).json({ token: gerarToken(usuario), usuario });
}

async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  const registro = await usuarios.buscarPorEmail(email);
  const senhaConfere = registro && (await bcrypt.compare(senha, registro.senha_hash));
  if (!senhaConfere) {
    return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
  }

  const usuario = { id: registro.id, nome: registro.nome, email: registro.email };
  res.json({ token: gerarToken(usuario), usuario });
}

module.exports = { cadastro, login };
