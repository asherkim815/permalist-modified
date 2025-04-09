import express from 'express';
import pg from 'pg';
import 'dotenv/config';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const db = new pg.Client({
  port: process.env.DB_PORT,
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
  await db.query('INSERT INTO items (task) VALUES ($1)', [
    req.body['add-task'],
  ]);
  res.redirect('/');
});

app.post('/edit', async (req, res) => {
  await db.query('UPDATE items SET task = ($1) WHERE id = $2', [
    req.body['edit-task'],
    req.body['edit-id'],
  ]);
  res.redirect('/');
});

app.post('/delete', async (req, res) => {
  await db.query('DELETE FROM items WHERE id = $1', [req.body['delete-id']]);
  res.redirect('/');
});

app.listen(process.env.APP_PORT, () => {
  console.log(`Serving on port ${process.env.APP_PORT}`);
});
