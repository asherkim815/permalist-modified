import express from 'express';
import pg from 'pg';
import 'dotenv/config';

const port = 3000;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new pg.Client({
  port: process.env.PORT,
  host: process.env.HOST,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
});
db.connect();

app.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM items ORDER BY id ASC');
  res.render('index.ejs', {
    items: result.rows,
  });
});

app.post('/add', async (req, res) => {
  await db.query('INSERT INTO items (task) VALUES ($1)', [req.body.addTask]);
  res.redirect('/');
});

app.post('/edit', async (req, res) => {
  await db.query('UPDATE items SET task = ($1) WHERE id = $2', [
    req.body.editTask,
    req.body.editId,
  ]);
  res.redirect('/');
});

app.post('/delete', async (req, res) => {
  await db.query('DELETE FROM items WHERE id = $1', [req.body.deleteId]);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
