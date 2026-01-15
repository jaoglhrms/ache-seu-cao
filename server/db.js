const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./pethunt.db', (err) => {
  if (err) console.error('Erro ao conectar:', err.message);
  else console.log('Conectado ao banco SQLite (Versão 1 Foto).');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    imageUrl TEXT, 
    contact TEXT,
    type TEXT,
    neighborhood TEXT,
    color TEXT,
    size TEXT,
    sex TEXT,
    date TEXT,
    ownerName TEXT,
    ownerEmail TEXT,
    status TEXT DEFAULT 'open',
    linkedPostId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;