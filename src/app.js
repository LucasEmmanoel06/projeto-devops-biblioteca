const path = require('path');
const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.get('/health', (req, res) => {res.status(200).json({ status: 'ok' });});

// Frontend estático
app.use(express.static(path.join(__dirname, '../public')));

app.use(errorHandler);

module.exports = app;
