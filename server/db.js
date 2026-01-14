const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Necessário para o Neon
});

async function query(text, params) {
  return pool.query(text, params);
}

async function initializeDb() {
  // Cria a tabela se não existir (Sintaxe Postgres)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pets (
      id SERIAL PRIMARY KEY,
      type TEXT,
      status TEXT,
      name TEXT,
      description TEXT,
      neighborhood TEXT,
      lat REAL,
      lng REAL,
      color TEXT,
      size TEXT,
      sex TEXT,
      date TEXT,
      contact TEXT,
      imageUrl TEXT,
      ownerName TEXT,
      ownerEmail TEXT,
      linkedPostId INTEGER
    )
  `);
  console.log("Banco de dados PostgreSQL conectado!");
}

module.exports = { query, initializeDb };