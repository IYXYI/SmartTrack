const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'habits.db');
const SEED_PATH = path.join(__dirname, 'data', 'seed.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  await runAsync(
    `CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`
  );

  await runAsync(
    `CREATE TABLE IF NOT EXISTS completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(habit_id) REFERENCES habits(id)
    )`
  );

  const rows = await allAsync('SELECT COUNT(*) as cnt FROM habits');
  if (rows && rows[0] && rows[0].cnt === 0) {
    // Seed from seed.json if present
    if (fs.existsSync(SEED_PATH)) {
      const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
      for (const h of seed.habits || []) {
        const res = await runAsync('INSERT INTO habits (name) VALUES (?)', [h.name]);
        const id = res.lastID;
        if (h.completions) {
          for (const d of h.completions) {
            await runAsync('INSERT INTO completions (habit_id, date) VALUES (?, ?)', [id, d]);
          }
        }
      }
      console.log('Seeded database from data/seed.json');
    }
  }
}

function todayStr(offset = 0) {
  const d = new Date();
  if (offset) d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function getHabitsWithTodayCompletion() {
  const habits = await allAsync('SELECT * FROM habits ORDER BY id DESC');
  const today = todayStr();
  for (const h of habits) {
    const rows = await allAsync('SELECT COUNT(*) as cnt FROM completions WHERE habit_id = ? AND date = ?', [h.id, today]);
    h.completedToday = rows && rows[0] && rows[0].cnt > 0;
  }
  return habits;
}

async function getStreaks() {
  const habits = await allAsync('SELECT id, name FROM habits');
  const streaks = [];
  for (const h of habits) {
    let streak = 0;
    let dayOffset = 0;
    while (true) {
      const date = todayStr(-dayOffset);
      const rows = await allAsync('SELECT COUNT(*) as cnt FROM completions WHERE habit_id = ? AND date = ?', [h.id, date]);
      if (rows && rows[0] && rows[0].cnt > 0) {
        streak += 1;
        dayOffset += 1;
      } else break;
    }
    streaks.push({ habitId: h.id, name: h.name, streak });
  }
  return streaks;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/habits', async (req, res) => {
  try {
    const habits = await getHabitsWithTodayCompletion();
    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'name required' });
    const result = await runAsync('INSERT INTO habits (name) VALUES (?)', [name.trim()]);
    const id = result.lastID;
    const habit = await allAsync('SELECT * FROM habits WHERE id = ?', [id]);
    res.json(habit[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

app.patch('/api/habits/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    const date = todayStr();
    const rows = await allAsync('SELECT id FROM completions WHERE habit_id = ? AND date = ?', [id, date]);
    if (rows && rows.length > 0) {
      // delete (untoggle)
      await runAsync('DELETE FROM completions WHERE habit_id = ? AND date = ?', [id, date]);
      res.json({ id, completedToday: false });
    } else {
      await runAsync('INSERT INTO completions (habit_id, date) VALUES (?, ?)', [id, date]);
      res.json({ id, completedToday: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const streaks = await getStreaks();
    res.json(streaks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// fallback: serve index.html for SPA routes
app.get('*', (req, res) => {
  const index = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(index)) res.sendFile(index);
  else res.status(404).send('Not found');
});

const PORT = process.env.PORT || 8080;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to init DB', err);
    process.exit(1);
  });
