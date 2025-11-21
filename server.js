const express = require('express');
const path = require('path');
const { db, migrate } = require('./db');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

// Run migrations automatically on start (safe for dev)
migrate();

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Serve frontend static
app.use('/', express.static(path.join(__dirname, 'public')));

// Helpers: prepared statements
const insertStmt = db.prepare(`INSERT INTO reviews (id, title, comment, rating, name, email, created) VALUES (@id,@title,@comment,@rating,@name,@email,@created)`);
const selectAllStmt = db.prepare(`SELECT * FROM reviews`);
const selectByIdStmt = db.prepare(`SELECT * FROM reviews WHERE id = ?`);
const updateStmt = db.prepare(`UPDATE reviews SET title=@title, comment=@comment, rating=@rating, name=@name, email=@email WHERE id=@id`);
const deleteStmt = db.prepare(`DELETE FROM reviews WHERE id = ?`);

// GET /api/reviews -> list
app.get('/api/reviews', (req, res) => {
    const rows = selectAllStmt.all();
    res.json(rows);
});

// GET /api/reviews/:id
app.get('/api/reviews/:id', (req, res) => {
    const row = selectByIdStmt.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
});

// POST /api/reviews -> create
app.post('/api/reviews', (req, res) => {
    const { id, title, comment, rating, name, email, created } = req.body;
    if (!title || !comment || !rating) return res.status(400).json({ error: 'title, comment and rating required' });
    const payload = {
        id: id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
        title, comment, rating: Number(rating), name: name || null, email: email || null, created: created || Date.now()
    };
    try {
        insertStmt.run(payload);
        res.status(201).json(payload);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'db error' });
    }
});

// PUT /api/reviews/:id -> update
app.put('/api/reviews/:id', (req, res) => {
    const id = req.params.id;
    const { title, comment, rating, name, email } = req.body;
    const existing = selectByIdStmt.get(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    try {
        updateStmt.run({ id, title: title || existing.title, comment: comment || existing.comment, rating: rating || existing.rating, name, email });
        const row = selectByIdStmt.get(id);
        res.json(row);
    } catch (err) {
        console.error(err); res.status(500).json({ error: 'db error' });
    }
});

// DELETE /api/reviews/:id
app.delete('/api/reviews/:id', (req, res) => {
    const id = req.params.id;
    try {
        deleteStmt.run(id);
        res.status(204).end();
    } catch (err) { console.error(err); res.status(500).json({ error: 'db error' }); }
});

// POST /api/import -> import array of reviews (replace existing)
app.post('/api/import', (req, res) => {
    const arr = req.body;
    if (!Array.isArray(arr)) return res.status(400).json({ error: 'Array expected' });
    const trx = db.transaction((rows) => {
        db.prepare('DELETE FROM reviews').run();
        const insert = db.prepare('INSERT INTO reviews (id, title, comment, rating, name, email, created) VALUES (@id,@title,@comment,@rating,@name,@email,@created)');
        for (const r of rows) {
            // basic validation
            if (!r.id || !r.title || !r.comment || !r.rating) continue;
            insert.run({ id: r.id, title: r.title, comment: r.comment, rating: Number(r.rating), name: r.name || null, email: r.email || null, created: r.created || Date.now() });
        }
    });
    try {
        trx(arr);
        res.json({ ok: true, imported: arr.length });
    } catch (err) { console.error(err); res.status(500).json({ error: 'import failed' }); }
});

// GET /api/export -> download all as JSON
app.get('/api/export', (req, res) => {
    const rows = selectAllStmt.all();
    res.setHeader('Content-Disposition', 'attachment; filename="avaliacoes_export.json"');
    res.json(rows);
});

// fallback to index.html for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));