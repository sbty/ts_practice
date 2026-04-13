import express from 'express';
import db from './db.js';

const app = express();
app.use(express.json());

app.get('/api/todos', (req, res) => {
    const stmt = db.prepare('SELECT * FROM todos');
    const todos = stmt.all();
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task required' });

    const stmt = db.prepare('INSERT INTO todos (task) VALUES (?)');
    const result = stmt.run(task);

    res.status(201).json({ id: result.lastInsertRowid, task, completed: 0 });
});

app.delete('/api/todos/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
});

export default app;
