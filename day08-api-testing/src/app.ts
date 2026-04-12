import express from 'express';
import { TodoStorage } from './storage.js';

const app = express();
const storage = new TodoStorage();

app.use(express.json());

app.get('/api/todos', async (req, res) => {
    const todos = await storage.load();
    res.json(todos);
});

app.post('/api/todos', async (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task required' });

    const todos = await storage.load();
    const newTodo = { id: Date.now(), task, completed: false };
    todos.push(newTodo);
    await storage.save(todos);
    res.status(201).json(newTodo);
});

export default app;
