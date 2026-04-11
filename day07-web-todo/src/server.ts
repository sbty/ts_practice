import express from 'express';
import { TodoStorage } from './storage.js';
import { CreateTodoRequest } from './types.js';

const app = express();
const PORT = 3000;
const storage = new TodoStorage();

// 重要！：送られてきたJSONボディを解析するための設定
app.use(express.json());

// 1. 全件取得 (GET /api/todos)
app.get('/api/todos', async (req, res) => {
    const todos = await storage.load();
    res.json(todos);
});

// 2. 新規追加 (POST /api/todos)
app.post('/api/todos', async (req, res) => {
    const { task } = req.body as CreateTodoRequest;

    if (!task) {
        res.status(400).json({ error: 'Task content is required' });
        return;
    }

    const todos = await storage.load();
    const newTodo = { id: Date.now(), task, completed: false };
    todos.push(newTodo);
    await storage.save(todos);

    res.status(201).json(newTodo);
});

// 3. 削除 (DELETE /api/todos/:id)
app.delete('/api/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const todos = await storage.load();
    const filtered = todos.filter(t => t.id !== id);
    
    await storage.save(filtered);
    res.status(204).send(); 
});

app.listen(PORT, () => {
    console.log(`------------------------------------------`);
    console.log(`🌐 Todo API is running at http://localhost:${PORT}`);
    console.log(`------------------------------------------`);
});
