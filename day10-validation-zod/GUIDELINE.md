# Day 10: バリデーションと堅牢なAPI（Zodの応用）

本日は、ユーザーから送られてくるデータを厳格にチェックする **「バリデーション」** を学びます。
プログラムは「正しいデータが来る」と信じてはいけません。「間違ったデータが来ても、正しくエラーを返す」のがプロのコードです。

---

## 1. バリデーション・スキーマの定義

「どのような形式のデータが正しいか」を定義します。Zodを使えば、これ一つで「チェック用コード」と「TypeScriptの型」の両方を手に入れられます。

**📄 `src/schema.ts`**
```typescript
import { z } from 'zod';

/**
 * タスク作成時の入力ルール
 */
export const CreateTodoSchema = z.object({
    // taskは文字列で、最低3文字、最大100文字というルール
    task: z.string()
           .min(3, { message: "タスク名は3文字以上で入力してください" })
           .max(100, { message: "タスク名が長すぎます" }),
});

// スキーマから自動的に型を抽出！
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
```

---

## 2. バリデーション・ミドルウェアの作成

各ルート（POST / DELETEなど）で毎回バリデーションコードを書くのは非効率です。
Expressの **「ミドルウェア（関門）」** の仕組みを使い、自動でチェックしてエラーを返す汎用的な関数を作ります。

**📄 `src/middleware.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * リクエストボディをバリデーションするミドルウェア
 * @param schema チェックに使うZodスキーマ
 */
export const validate = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 解析実行！成功すれば値が req.body に上書きされ、next() で次の処理へ
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // バリデーションエラーが起きたら、400 Bad Request を返す
                res.status(400).json({
                    error: "Validation failed",
                    details: error.errors.map(e => e.message)
                });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    };
};
```

---

## 3. アプリケーションに適用する

作成したミドルウェアを、`app.post` の途中に挟み込みます。

**📄 `src/app.ts`**
```typescript
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

// 新規作成（途中に validate(CreateTodoSchema) を挟む！）
app.post('/api/todos', validate(CreateTodoSchema), (req, res) => {
    // ここに来たとき、req.body はすでに検証済みであることが保証されている！
    const { task } = req.body as CreateTodoInput;

    const stmt = db.prepare('INSERT INTO todos (task) VALUES (?)');
    const result = stmt.run(task);

    res.status(201).json({ id: result.lastInsertRowid, task, completed: 0 });
});

export default app;
```

---

## 4. 動作確認

以下のコマンドでサーバーを起動します。
```powershell
npx tsx src/server.ts
```

### 【あえて失敗させるテスト】
タスク名をわざと **「1文字（3文字未満）」** にして送信してみてください。

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/todos -Method Post -ContentType "application/json" -Body '{"task":"あ"}'
```

サーバーから「タスク名は3文字以上で入力してください」という丁寧なエラーメッセージが返ってくれば大成功です！🎉

---

## 本日のポイント
- **Defense in Depth（多層防御）**: データベースに不正なデータが入る前に、入り口で弾く。
- **Higher Order Function（高階関数）**: `validate` 関数のように「関数を返す関数」を作ることで、ミドルウェアを柔軟に使いまわせるようになります。
- **Zodの強力さ**: 単なる型定義だけでなく、実データとしてのバリデーションも同時に行えるのが現代のTypeScript開発のスタンダードです。
