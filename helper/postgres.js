const { Pool } = require('pg');

const connection = new Pool({
  user: 'user',
  host: 'postgres_db',
  database: 'app',
  password: '12345678',
  port: 5432
});

module.exports = connection;