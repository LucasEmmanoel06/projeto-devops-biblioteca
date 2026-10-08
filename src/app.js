const path = require('path');
const express = require('express');

const app = express();

app.use(express.json());

// Rotas da API
app.get('/health', (req, res) => {res.status(200).json({ status: 'ok' });});

// Frontend estático
app.use(express.static(path.join(__dirname, '../public')));

module.exports = app;
