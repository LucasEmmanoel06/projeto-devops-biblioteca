const mysql = require('mysql2/promise');
const { DB } = require('../config/env');

// Pool de conexões: todas as queries usam await db.execute(sql, [parametros])
module.exports = mysql.createPool({
  host: DB.host,
  port: DB.port,
  user: DB.user,
  password: DB.password,
  database: DB.name,
  charset: 'utf8mb4',
  connectionLimit: 10,
});
