// backend/config/firebird.js
const dotenv = require('dotenv');
const path = require('path');

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebirdOptions = {
  host: process.env.FIREBIRD_HOST,
  port: parseInt(process.env.FIREBIRD_PORT, 10),
  database: process.env.FIREBIRD_DATABASE,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
};

module.exports = { firebirdOptions };
