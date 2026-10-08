require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no arquivo .env (veja o .env.example).');
  process.exit(1);
}

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'biblioteca',
  },
};
