# Day 4: Node.jsの極意！ファイルシステム操作と再帰処理

本日は、バックエンド開発やツール作成で絶対に必要となる「ファイルシステム（OSのファイルやフォルダ）」の操作を学びます。
お題は「**指定したフォルダの中身を（中のフォルダのさらに中まで）すべて取得し、合計サイズを計算するCLIツール**」です！

---

## 1. フォルダの準備と環境のコピー

以下をターミナルで実行して、環境を用意します。本日は追加の外部ライブラリは使いません（Node.jsにあらかじめ入っている機能だけで作ります）。

```powershell
cd C:\dev\ts_practice
mkdir day04-dir-analyzer
cd day04-dir-analyzer
mkdir src

# 環境ファイルの引継ぎとインストール
Copy-Item ../day01-ts-setup/package.json .
Copy-Item ../day01-ts-setup/tsconfig.json .
npm install
```

---

## 2. 【実装】 再帰的なファイルサイズ計算関数

`src` フォルダ内に `analyzer.ts` を作成し、以下をコピペします。

**📄 `src/analyzer.ts`**
```typescript
// Node.jsが最初から持っている強力な機能（モジュール）をインポート
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 指定されたディレクトリ内のすべてのファイルサイズを再帰的に合計して返す
 * @param dirPath 調べたいフォルダのパス
 * @returns 合計サイズ（バイト数）
 */
export async function calculateTotalSize(dirPath: string): Promise<number> {
    let totalSize = 0;

    // 1. フォルダの中にある「ファイルとフォルダのリスト」を取得する
    // withFileTypes: true をつけると、それがファイルかフォルダか判別できるようになります
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    // 2. 取得したリストを1つずつチェックする
    for (const item of items) {
        // パスを結合する（例: 'C:/dev' と 'test.txt' をくっつけて 'C:/dev/test.txt'にする）
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
            // もしアイテムが「フォルダ」なら、さらにその中身を調べるために【自分自身（関数）を呼び出す】
            // これを「再帰処理 (Recursion)」と呼びます！
            totalSize += await calculateTotalSize(fullPath);
        } else {
            // もしアイテムが「ファイル」なら、そのサイズを取得して足し合わせる
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
        }
    }

    return totalSize;
}
```

> **💡 解説 (再帰処理について)**:
> フォルダの中にフォルダがあり、その中にさらにフォルダがある...と続くような「入れ子（ツリー構造）」のデータを扱うとき、プログラミングでは「**自分自身をもう一度呼び出す（再帰）**」という魔法のようなテクニックをよく使います。これを使うと複雑なファイルツリーもたった25行のコードで全て探索できてしまいます。

---

## 3. 【テスト】 安全性の確認

`src` フォルダ内に `analyzer.test.ts` を作成し、テストをコピペします。
ファイルアクセスを含む処理のテストは少し複雑になるため、今回は「**存在しないフォルダを指定したときに、想定通りエラーを投げるか？**」という防御面のTDDを行います。

**📄 `src/analyzer.test.ts`**
```typescript
import { describe, expect, it } from 'vitest';
import { calculateTotalSize } from './analyzer';

describe('Directory Analyzer', () => {
    it('存在しないパスを渡した時、エラーを投げること', async () => {
        const dummyPath = './絶対に存在しない隠されしフォルダ';
        
        // await が絡むエラーのテストは、rejects.toThrow() を使います
        await expect(calculateTotalSize(dummyPath)).rejects.toThrow();
    });
});
```

実行してテストがPASSするか確認します！
```powershell
npm run test
```

---

## 4. プラグラムの実行！

では作ったツールを動かしてみましょう。
`src` フォルダ内に `index.ts` を作成してください。

**📄 `src/index.ts`**
```typescript
import { calculateTotalSize } from './analyzer';
import * as path from 'path';

async function main() {
    // ターゲットを「初日に作った day01 のフォルダ」にしてみます
    const targetDir = path.resolve('../day01-ts-setup');
    console.log(`📂 [${targetDir}] の中身を調べています...`);
    
    try {
        const sizeInBytes = await calculateTotalSize(targetDir);
        
        // バイトだと分かりにくいので キロバイト(KB) に変換して少数第二位までに丸める
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        console.log(`✅ 合計サイズ: ${sizeInKB} KB です！`);

    } catch (error) {
        console.error("❌ エラーが発生しました:", error);
    }
}

main();
```

以下のコマンドで実行してみましょう！

```powershell
npx ts-node src/index.ts
```

フォルダの中身を全て再帰的に計算した合計サイズが出力されれば大成功です🎉

---

## 5. Gitコミットの手順

```powershell
# ルートフォルダに移動する
cd C:\dev\ts_practice

# Day 4用の機能ブランチを切る
git checkout -b feature/day04-dir-analyzer

# 作業内容をステージに追加してコミット
git add day04-dir-analyzer
git commit -m "feat: 再帰処理を用いたファイルサイズ集計ツールの作成"

# メインブランチに統合してPush
git checkout main
git merge feature/day04-dir-analyzer
git push origin main
```

以上でDay 4は終了です！
