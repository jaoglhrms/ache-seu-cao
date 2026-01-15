const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// --- BANCO DE DADOS (Versão Simples) ---
const db = new sqlite3.Database('./pethunt.db', (err) => {
  if (err) console.error('Erro ao criar banco:', err.message);
  else console.log('Banco de dados criado/conectado.');
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

// --- UPLOAD (Versão 1 Foto) ---
const IMGUR_CLIENT_ID = 'e65d209fc396594'; // Seu ID
const upload = multer({ storage: multer.memoryStorage() }).single('image'); 

async function uploadToImgur(buffer) {
  try {
    const response = await axios.post('https://api.imgur.com/3/image', buffer, {
      headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` }
    });
    return response.data.data.link;
  } catch (error) {
    console.error("Erro Imgur:", error.response?.data);
    throw new Error('Falha no upload da imagem');
  }
}

// ROTA POST (Salvar Pet)
app.post('/api/pets', upload, async (req, res) => {
  try {
    const { name, description, contact, type, neighborhood, color, size, sex, date, ownerEmail, ownerName } = req.body;
    
    if (!req.file) return res.status(400).json({ error: 'Imagem obrigatória.' });

    // Converte a imagem para Base64 em vez de subir para o Imgur
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const stmt = db.prepare('INSERT INTO pets (name, description, imageUrl, contact, type, neighborhood, color, size, sex, date, ownerEmail, ownerName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(name, description, base64Image, contact, type, neighborhood, color, size, sex, date, ownerEmail, ownerName, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, imageUrl: base64Image });
    });
    stmt.finalize();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ROTA GET (Listar Pets)
app.get('/api/pets', (req, res) => {
  const { type, neighborhood, sex, size, color } = req.query;
  let query = 'SELECT * FROM pets WHERE status != "resolved"';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (neighborhood) { query += ' AND neighborhood = ?'; params.push(neighborhood); }
  if (sex) { query += ' AND sex = ?'; params.push(sex); }
  if (size) { query += ' AND size = ?'; params.push(size); }
  
  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rotas Extras
app.delete('/api/pets/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM pets WHERE id = ?', id, (err) => res.json({ deleted: true }));
});
app.patch('/api/pets/:id/resolve', (req, res) => {
    const { id } = req.params;
    db.run("UPDATE pets SET status = 'resolved' WHERE id = ?", id, (err) => res.json({ resolved: true }));
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));