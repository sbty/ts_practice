# Day 7: Web Todo API（データの受信とPOST）

本日は、Day 5で作った「Todo管理ロジック」と Day 6で学んだ「Webサーバー」を合体させます。
今回の目玉は **「クライアントから送られてくるJSONデータを受け取って処理する」** ことです。
これができるようになると、フロントエンド（React/Next.jsなど）からデータを送信してDBに保存する、といった本格的な機能が作れるようになります！

---

## 1. データの型を定義する

Day 5と同じですが、APIのレスポンスやリクエストで使う型を定義します。

**📄 `src/types.ts`**
```typescript
export interface Todo {
    id: number;
    task: string;
    completed: boolean;
}

/**
 * 新規作成時にクライアントから送られてくるデータの形
 */
export interface CreateTodoRequest {
    task: string;
}
```

---

## 2. ストレージ（保存）ロジックの再利用

Day 5で作ったクラスをそのまま使います。コードを使いまわせるのがクラス設計の良いところです。

**📄 `src/storage.ts`**
```typescript
import * as fs from 'fs/promises';
import { Todo } from './types.js';

const FILE_PATH = './tasks.json';

export class TodoStorage {
    async load(): Promise<Todo[]> {
        try {
            const data = await fs.readFile(FILE_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async save(todos: Todo[]): Promise<void> {
        await fs.writeFile(FILE_PATH, JSON.stringify(todos, null, 2));
    }
}
```

---

## 3. Web API の実装（POST / DELETE）

ここが本日のメインです。`express.json()` という魔法の一行を追加することで、JSONデータを受け取れるようになります。

**📄 `src/server.ts`**
```typescript
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
    // req.body に送られてきたデータが入っている（型をアサーションして安全に扱う）
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
// :id の部分は「パスパラメータ」と呼ばれ、req.params.id で取得できます
app.delete('/api/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const todos = await storage.load();
    const filtered = todos.filter(t => t.id !== id);
    
    await storage.save(filtered);
    res.status(204).send(); // 204 No Content: 削除成功を意味する
});

app.listen(PORT, () => {
    console.log(`🌐 Todo API is running at http://localhost:${PORT}`);
});
```

---

## 4. 動作確認の方法

サーバーを起動します。
```powershell
npx tsx src/server.ts
```

ブラウザだけでは `POST` や `DELETE` を試すことができません。VS Codeの拡張機能（Thunder Client / REST Client）を使うか、新しくコマンドプロンプトを開いて `curl` を使ってテストしてみましょう！

**タスクを追加するコマンド例:**
```powershell
curl -X POST -H "Content-Type: application/json" -d '{\"task\": \"APIをテストする\"}' http://localhost:3000/api/todos
```
> ※ Windowsのcurlでは `\"` のようにエスケープが必要な場合があります。

---

## 本日のポイント
- **`app.use(express.json())`**: これがないと `req.body` が undefined になります。超重要！
- **POSTリクエスト**: データの作成に使用。
- **パスパラメータ (`:id`)**: URLの一部を「変数」として使い、特定のデータを指定する。
- **ステータスコード**: `201` (作成成功), `204` (削除成功), `400` (不正なリクエスト)など、数字で結果を伝える。
