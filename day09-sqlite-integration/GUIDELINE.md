# Day 9: SQLiteデータベースへの移行

本日は、ついに「データの保存先」をテキストファイル（JSON）から、本物のデータベースである **SQLite** へとアップグレードします。
実際のアプリケーション開発で必須となる SQL (Structured Query Language) の基礎を学びましょう！

---

## 1. データベースの準備

Node.jsでSQLiteを扱うための定番ライブラリ `better-sqlite3` を使用します。

```powershell
# day09 フォルダ内で実行
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

---

## 2. データベース接続クラスの実装

まずは、データベースファイルを読み込み、テーブルを作成する「心臓部」を作ります。

**📄 `src/db.ts`**
```typescript
import Database from 'better-sqlite3';

// データベースファイルの指定（実行すると local.db というファイルが作られます）
const db = new Database('local.db');

// 初回起動時にテーブルを作成する
// SQLのキホン: CREATE TABLE (テーブル作成)
db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        completed INTEGER DEFAULT 0
    )
`);

export default db;
```

---

## 3. アプリケーションの実装（SQLの発行）

`app.ts` で、JSONファイルへの読み書きの代わりに、SQLを発行してデータを操作するように書き換えます。

**📄 `src/app.ts`**
```typescript
import express from 'express';
import db from './db.js';

const app = express();
app.use(express.json());

// 1. 全件取得 (SQL: SELECT)
app.get('/api/todos', (req, res) => {
    const stmt = db.prepare('SELECT * FROM todos');
    const todos = stmt.all();
    res.json(todos);
});

// 2. 新規作成 (SQL: INSERT)
app.post('/api/todos', (req, res) => {
    const { task } = req.body;
    if (!task) return res.status(400).json({ error: 'Task required' });

    const stmt = db.prepare('INSERT INTO todos (task) VALUES (?)');
    const result = stmt.run(task);

    // SQLの結果から、新しく作られたID（lastInsertRowid）を返却する
    res.status(201).json({ id: result.lastInsertRowid, task, completed: 0 });
});

// 3. 削除 (SQL: DELETE)
app.delete('/api/todos/:id', (req, res) => {
    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    // 削除された行があるかチェック
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
});

export default app;
```

---

## 4. 実行してみよう！

サーバーを起動します。
```powershell
npx tsx src/server.ts
```

起動すると、フォルダの中に `local.db` というファイルが生成されます。
Day 7と同じように `Invoke-RestMethod` などでデータを追加してみてください。

### Web Todo API のテスト用コマンド（再掲）
```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/todos -Method Post -ContentType "application/json" -Body '{"task":"データベースを試す"}'
```

---

## 本日のポイント
- **永続性**: JSONファイルとは異なり、データベースは大量のデータや複雑な検索を効率的に扱えます。
- **SQLインジェクション対策**: `stmt.run(task)` のように `?`（プレースホルダ）を使うことで、悪意のある入力からプログラムを守ることができます。
- **SQLiteの便利さ**: 別のサーバーを立てる必要がなく、ファイル1つで本格的なDB機能が手に入ります。
