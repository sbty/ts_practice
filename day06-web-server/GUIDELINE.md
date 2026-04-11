# Day 6: TypeScriptでWebサーバーを作ろう（Express編）

いよいよコンソール（黒い画面）を飛び出し、ブラウザからアクセスできる「Webサーバー」を作成します！
モダンなWeb開発で必須となる `Express` ライブラリを使い、型安全なAPI（Application Programming Interface）の基礎を学びましょう。

---

## 1. フォルダの準備とインストール

昨日までと同様、環境をコピーして必要なライブラリを追加します。今回は `express` 本体と、その型定義パッケージ `@types/express` を使用します。

```powershell
# day06 フォルダ内で実行
npm install express
npm install -D @types/express tsx
```

また、`package.json` に `"type": "module"` を追加し、ES Modules 形式で動作するように設定済みです。

---

## 2. APIレスポンスの型を定義する

Webサーバーがどのようなデータを返すか（仕様）を、インターフェースで定義します。
これにより、サーバー側もクライアント（呼び出し側）も、データの形を勘違いすることなく開発できます。

**📄 `src/types.ts`**
```typescript
/**
 * 基本的なAPIレスポンスの構造
 */
export interface HelloResponse {
    message: string;
    timestamp: string;
}

/**
 * サーバーの状態を表す構造
 */
export interface StatusResponse {
    status: 'ok' | 'error';
    version: string;
    uptime: number;
}
```

---

## 3. Expressサーバーの実装

`Express` を使って、特定のURL（パス）にアクセスが来た時の処理を書いていきます。

**📄 `src/server.ts`**
```typescript
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
    // 自分で定義した型を適用して、レスポンスの形を保証する
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
```

---

## 4. 実行してブラウザで確認！

以下のコマンドでサーバーを起動します。

```powershell
npx tsx src/server.ts
```

起動したら、ブラウザで以下のURLにアクセスしてみましょう！
- [http://localhost:3000/](http://localhost:3000/) （リッチな見出しが表示されます）
- [http://localhost:3000/api/hello](http://localhost:3000/api/hello) （JSONデータが返ってきます）

---

## 5. 本日の学び

- **Express**: Node.jsで最も有名なWebサーバー用フレームワーク。
- **Routing（ルーティング）**: `/api/hello` のように、URLのパスに応じて処理を切り分ける機能。
- **JSON Response**: ブラウザや他のアプリが読み取りやすい「データ形式」で結果を返す。

Webアプリの「裏側（バックエンド）」を作る第一歩を踏み出しました！
明日は、このサーバーに「データを送信（POST）」する方法や、より複雑な処理を学んでいきましょう。
