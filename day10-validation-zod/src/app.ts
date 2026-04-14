import express from 'express';
import db from './db.js';
import { validate } from './middleware.js';
import { CreateTodoSchema, CreateTodoInput } from './schema.js';

const app = express();
app.use(express.json());

// 一覧取得
app.get('/api/todos', (req, res) => {
    const todos = db.prepare('SELECT * FROM todos').all();
    res.json(todos);
});

// 新規作成
app.post('/api/todos', validate(CreateTodoSchema), (req, res) => {
    // req.body is already validated
    const { task } = req.body as CreateTodoInput;

    const stmt = db.prepare('INSERT INTO todos (task) VALUES (?)');
    const result = stmt.run(task);

    res.status(201).json({ id: result.lastInsertRowid, task, completed: 0 });
});

export default app;
