# Day 1: TypeScript開発の「最強の土台」を作る

今日はコーディングそのものではなく、**TypeScriptプロジェクトを始めるための土台作り**を学びます。
本番運用に耐えうるプロジェクトには「コードを整形する Linter/Formatter」「コードが壊れていないか確認する Test Runner」「Gitコミット時に自動でチェックを走らせる Gitフック」が必要です。

タイピングに時間を割かないよう、以下の手順に沿ってターミナルのコマンドやソースコードをコピペし、ファイルを作成していきましょう。解説を読んで仕組みを理解することが本日の最大のゴールです。

---

## 1. セットアップの実行

PowerShell (Terminal) を開き、`c:\dev\ts_practice` フォルダ内で新しいプロジェクトフォルダを作ります。以下のコマンドを一行ずつコピペして実行してください。

```powershell
# フォルダの作成と移動
mkdir day01-ts-setup
cd day01-ts-setup

# Node.jsプロジェクトの初期化 (package.json の作成)
npm init -y

# TypeScriptと必要な型定義、ts-node(開発環境向け実行ツール)のインストール
npm i -D typescript @types/node ts-node
```

> **💡 解説**: `-D` フラグは「開発環境でのみ使う」というパッケージであることを示します。TypeScriptは実行時にJavaScriptに変換されるため、本番サーバーに配置する時には必要ありません。

---

## 2. tsconfig.json の作成

TypeScriptコンパイラに「どのようにチェックをして変換するか」を指示する設定ファイルです。

`day01-ts-setup` フォルダ内に `tsconfig.json` というファイルを作成し、中身を以下に置き換えてください。

**📄 `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

> **💡 パラメータ解説**:
> - `"strict": true`: これが最も重要です。「Nullになり得る変数へのアクセス」などを厳密にエラーにしてくれます。（これがないとTSを使う意味が半減します）
> - `"rootDir"` と `"outDir"`: `src/` に書いたTSコードが `dist/` にJSとしてコンパイルされて出力されるというルール。

---

## 3. テスト環境 (Vitest) の導入

TypeScript/JavaScriptのテストフレームワークは色々ありますが、現在は非常に高速な **Vitest** が主流になりつつあります。

ターミナルで以下を実行します。

```powershell
npm i -D vitest
```

次に、動作確認のためにファイルを作ります。`src`フォルダを作成し、その中に `math.ts` と `math.test.ts` を作成してください。

**📄 `src/math.ts` (実装コード)**
```typescript
/**
 * 2つの数値を足し合わせる安全な関数
 */
export function add(a: number, b: number): number {
  return a + b;
}
```

**📄 `src/math.test.ts` (テストコード)**
```typescript
import { expect, test } from 'vitest';
import { add } from './math';

test('1 + 2 は 3になるべき', () => {
  // expect() で与えた結果が、toBe() の期待値と一致するかをチェックする
  expect(add(1, 2)).toBe(3);
});
```

`package.json` を開き、`"scripts"` の部分を以下のように修正してください。

**📄 `package.json` (一部抜粋)**
```json
  "scripts": {
    "test": "vitest run"
  }
```

ターミナルで `npm run test` と打つと、テストが実行されて「PASS」となるはずです。

---

## 4. Git フック (Husky) への挑戦 (発展編)

「チーム開発で、テストが落ちているコードをGitにコミットさせない」仕組みを作ります。これを自動化できるのが **Husky** というツールです。

コマンドで以下を実行します。

```powershell
# Gitリポジトリを初期化 (初回のみ)
git init

# Huskyのインストールと初期設定
npm i -D husky
npx husky init
```

実行すると `.husky/pre-commit` というファイルが生成されます。これをメモ帳やエディタで開き、中身を次のように書き換えます。

**📄 `.husky/pre-commit`**
```shell
npm run test
```

> **💡 解説**: コミットしようと `git commit` を打った瞬間に、バックグラウンドで `npm run test` が実行されます。もしテストが失敗（FAIL）した場合、コミット自体がキャンセルされます。これによって壊れたコードが履歴に残ることを未然に防げます。

---

## 🍔 今日のチェックリスト

以下のタスクが完了したら、Gitブランチの作成〜コミットを体験して本日は完了です。

1. [ ] `day01-ts-setup` フォルダの立ち上げ
2. [ ] `tsconfig.json` の作成とコピペ
3. [ ] `math.ts` と `math.test.ts` で関数とテストを作成
4. [ ] `npm run test` でテストがPASSしたことを確認！

### Gitワークフローの実践

最後に、変更を保存してメインの履歴に統合しましょう。

```powershell
# 1. ブランチを切る (Day1の作業用)
git checkout -b feature/day01-setup

# 2. 全ての変更をステージングに乗せる
git add .

# 3. コミットする (ここで自動的に vitest が走ります！)
git commit -m "feat: 初期環境構築とVitestの導入"

# 4. (本来はここでGithub上でPull Requestを作りますが、今回はローカルでマージします)
git checkout main
git merge feature/day01-setup
```

お疲れ様でした！Day 1はこれで完了です。
この基礎テンプレートは今後何日も使いまわすことになります。仕組みへの疑問があれば、ぜひAIアシスタントに質問して理解を深めてください。
