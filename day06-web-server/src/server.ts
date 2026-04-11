import express from 'express';
import { HelloResponse, StatusResponse } from './types.js';

const app = express();
const PORT = 3000;

// 1. トップページ (GET /)
app.get('/', (req, res) => {
    res.send('<h1>🚀 TypeScript Web Server is running!</h1><p>Try <a href="/api/hello">/api/hello</a></p>');
});

// 2. JSONを返すAPI (GET /api/hello)
app.get('/api/hello', (req, res) => {
    const response: HelloResponse = {
        message: 'Hello from TypeScript Server!',
        timestamp: new Date().toISOString()
    };
    res.json(response);
});

// 3. ステータス確認API (GET /api/status)
app.get('/api/status', (req, res) => {
    const status: StatusResponse = {
        status: 'ok',
        version: '1.0.0',
        uptime: process.uptime()
    };
    res.json(status);
});

// サーバーの起動
app.listen(PORT, () => {
    console.log(`------------------------------------------`);
    console.log(`🌐 Server is running at http://localhost:${PORT}`);
    console.log(`------------------------------------------`);
});
