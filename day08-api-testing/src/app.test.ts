import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './app';

describe('Todo API Integration Tests', () => {
    it('GET /api/todos が正常に返ってくること', async () => {
        const response = await request(app).get('/api/todos');
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/todos で新しいタスクが作成できること', async () => {
        const newTask = { task: 'Test automated testing' };
        const response = await request(app)
            .post('/api/todos')
            .send(newTask);
        
        expect(response.status).toBe(201);
        expect(response.body.task).toBe(newTask.task);
        expect(response.body).toHaveProperty('id');
    });

    it('不正なデータ（taskなし）でPOSTした時、400エラーになること', async () => {
        const response = await request(app)
            .post('/api/todos')
            .send({});
        
        expect(response.status).toBe(400);
    });
});
