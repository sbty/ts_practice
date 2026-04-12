# Day 8: Web APIの自動テスト（Supertest）

本日は、昨日作った「Web Todo API」に、プロの開発現場では必須となる「自動テスト」を導入します。
手動で `curl` や `Invoke-RestMethod` を打つのはもう終わりです！

今回の最大の工夫は、**「サーバーの定義(app)」と「サーバーの起動(listen)」を切り分ける** 設計の変更です。

---

## 1. サーバー構成の「分離」を理解する

これまでは `server.ts` の中でルーティングの定義も `app.listen` (起動) もすべて行っていました。
しかし、テスト時には「サーバーを実際に起動（ポートを専有）させたくない」というニーズがあります。

そこで、今日からは役割を次のように分けます：
- **📄 `src/app.ts`**: ルーティングやミドルウェアの定義のみを行い、`app` インスタンスを `export` する。
- **📄 `src/server.ts`**: `app` を読み込んで、実際に特定のポートで起動するだけのエントリーポイント。

---

## 2. サーバーの実装（リファクタリング）

まずはデータを定義し、サーバーを機能ごとにファイル分けして実装しましょう。

**📄 `src/types.ts`**
```typescript
export interface Todo {
    id: number;
    task: string;
    completed: boolean;
}
```

**📄 `src/app.ts` (定義のみ)**
```typescript
import express from 'express';
// ※ ストレージはDay 7と同じものを使います
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

export default app; // 他のファイル（テスト用など）から使えるように出力！
```

**📄 `src/server.ts` (起動のみ)**
```typescript
import app from './app.js';

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`🌐 Server is running at http://localhost:${PORT}`);
});
```

---

## 3. 自動テスト（Supertest）の作成

いよいよ本番です。`Supertest` を使うと、`app` オブジェクトを渡すだけで、仮想的にHTTPリクエストを飛ばして結果を検証できます。

**📄 `src/app.test.ts`**
```typescript
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
```

---

## 4. テストの実行

以下のコマンドで、すべてのテストが一瞬で完了します。

```powershell
npm run test
```

すべてのテストにチェックマークがついたら成功です！🎉

---

## 本日の学び
- **設計の分離**: テストしやすくするために、あえてファイルを分けました。
- **Supertest**: ブラウザやcurlの代わりに、コードでAPIを叩く相棒。
- **テストのメリット**: 一度テストを書いてしまえば、コードを書き換えた後に「どこか壊れていないかな？」と不安になる必要がなくなります。
