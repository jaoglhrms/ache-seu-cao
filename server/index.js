require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Configuração Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'pethunt_pvh', allowed_formats: ['jpg', 'png', 'jpeg'] },
});
const upload = multer({ storage: storage });

// Inicializa Banco
db.initializeDb();

// --- FUNÇÃO MÁGICA DE TRADUÇÃO (Postgres -> Frontend) ---
const fixRow = (row) => {
    if (!row) return null;
    return {
        ...row,
        imageUrl: row.imageurl,        // Traduz imageurl -> imageUrl
        ownerName: row.ownername,      // Traduz ownername -> ownerName
        ownerEmail: row.owneremail,    // Traduz owneremail -> ownerEmail
        linkedPostId: row.linkedpostid // Traduz linkedpostid -> linkedPostId
    };
};

// --- ROTAS ---

app.get('/api/pets', async (req, res) => {
  const { type, neighborhood, sex, size, color } = req.query;
  let queryText = "SELECT * FROM pets WHERE 1=1";
  const params = [];
  let counter = 1;

  if (type === 'missing') {
    queryText += " AND type = 'missing' AND status = 'open'";
  } else if (type === 'found') {
    queryText += " AND (type = 'found' OR status = 'resolved')";
  }

  if (neighborhood) { queryText += ` AND neighborhood = $${counter++}`; params.push(neighborhood); }
  if (sex) { queryText += ` AND sex = $${counter++}`; params.push(sex); }
  if (size) { queryText += ` AND size = $${counter++}`; params.push(size); }
  if (color) { queryText += ` AND color ILIKE $${counter++}`; params.push(`%${color}%`); }

  queryText += " ORDER BY id DESC";

  try {
    const result = await db.query(queryText, params);
    // AQUI: Usamos o .map(fixRow) para corrigir todos os itens da lista
    res.json(result.rows.map(fixRow)); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar" });
  }
});

app.post('/api/pets', upload.single('image'), async (req, res) => {
  try {
    let finalImageUrl = "https://placehold.co/300x200?text=Sem+Foto";
    if (req.file && req.file.path) finalImageUrl = req.file.path;

    const { type, name, description, neighborhood, lat, lng, color, size, sex, date, contact, ownerName, ownerEmail } = req.body;

    const result = await db.query(
      `INSERT INTO pets (type, status, name, description, neighborhood, lat, lng, color, size, sex, date, contact, imageUrl, ownerName, ownerEmail, linkedPostId)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        type, 'open', name || "Sem nome", description, neighborhood, 
        lat || null, lng || null, 
        color, size, sex, date, contact, finalImageUrl, ownerName || "Anônimo", ownerEmail, null
      ]
    );

    // AQUI: Corrigimos o item criado antes de devolver
    res.status(201).json(fixRow(result.rows[0]));
  } catch (error) {
    console.error("Erro ao salvar:", error);
    res.status(500).json({ error: "Erro ao salvar" });
  }
});

app.patch('/api/pets/:id/resolve', async (req, res) => {
    const { id } = req.params;
    await db.query("UPDATE pets SET status = 'resolved' WHERE id = $1", [id]);
    const result = await db.query("SELECT * FROM pets WHERE id = $1", [id]);
    res.json(fixRow(result.rows[0]));
});

app.patch('/api/pets/:id/match', async (req, res) => {
  const { id } = req.params;         
  const { targetId } = req.body;     
  await db.query("UPDATE pets SET linkedPostId = $1 WHERE id = $2", [targetId, id]);
  await db.query("UPDATE pets SET linkedPostId = $1 WHERE id = $2", [id, targetId]);
  res.json({ message: "Vínculo criado!" });
});

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pets WHERE id = $1", [id]);
    res.json({ message: "Post deletado!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar" });
  }
});

app.listen(PORT, () => console.log(`Backend Postgres rodando na porta ${PORT}`));