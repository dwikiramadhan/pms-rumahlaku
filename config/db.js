const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'mamakbapakayu',
  database: 'rumahlaku',
  port: 5432,
})

module.exports = pool