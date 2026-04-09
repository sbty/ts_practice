# Day 2: TSの型とTDD（テスト駆動開発）の実践

本日は「Markdown文字列をHTMLに変換する関数」の開発を通じて、**TDD（テスト駆動開発）** とTypeScriptの型の強さを体感します。

TDDは「**実装前に、結果がどうなるべきか（テスト）を先に書く**」という開発手法です。テストが失敗（Red）することを確認してからコードを書き、成功（Green）させることで、自信を持って開発を進められます。

---

## 1. 環境セットアップ（Day 1の資産をコピー）

ゼロから環境を作ると時間がかかるため、昨日作成した設定ファイルをそのまま活用します。ターミナルで以下を一行ずつコピペして実行してください。

```powershell
# ルート階層からDay 2のフォルダを作成して移動
cd C:\dev\ts_practice
mkdir day02-markdown-cli
cd day02-markdown-cli
mkdir src

# Day 1 から設定ファイル群をコピーしてくる
Copy-Item ../day01-ts-setup/package.json .
Copy-Item ../day01-ts-setup/tsconfig.json .

# 依存パッケージのインストール
npm install
```

---

## 2. 【TDDステップ 1】 実装より先に「テスト」を書く (Redの確認)

`src` フォルダ内に `parser.test.ts` というファイルを作成し、以下のコードをコピペしてください。
ここでは「関数はこう動くべき」という期待値だけを定義しています。

**📄 `src/parser.test.ts`**
```typescript
import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './parser';

describe('Markdown Parser', () => {
  it('見出し1 (#) を <h1> タグに変換できるか', () => {
    const input = '# Hello TypeScript';
    const expected = '<h1>Hello TypeScript</h1>';
    expect(parseMarkdown(input)).toBe(expected);
  });

  it('太字 (**) を <strong> タグに変換できるか', () => {
    const input = 'This is **bold** text.';
    const expected = 'This is <strong>bold</strong> text.';
    expect(parseMarkdown(input)).toBe(expected);
  });
});
```

> **🔥 Action:**  
> エディタ上ではおそらく、２行目の `import { parseMarkdown }` の部分に**赤い波線（エラー）**が出ているはずです。TypeScriptが「そんな関数は存在しないよ」と先に教えてくれています。

---

## 3. 【TDDステップ 2】 型付きで実装を書く (Greenにする)

それでは、関数を作ってエラーを解消し、テストを通しましょう。
`src` フォルダ内に `parser.ts` を作成し、以下をコピペします。

**📄 `src/parser.ts`**
```typescript
/**
 * 入力されたMarkdown文字列内の特定の記法を、HTMLタグに置換して返す
 * @param text パース対象のMarkdown文字列
 * @returns HTMLに変換された文字列
 */
export function parseMarkdown(text: string): string {
  // 1. '# ' で始まる行を <h1> に置換
  // (正規表現を用いて、行頭の#とそれに続く文字をキャプチャして置換)
  let html = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 2. '**文字**' を <strong>文字</strong> に置換
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return html;
}
```

> **💡 解説**:
> TypeScriptの最大の魅力は、`function ... (text: string): string` のように、**「引数に何を受け取り、何を返すのか」が明示されている**点です。これにより、間違って数値を渡すなどのバグを未然に防ぎます。
> 実装内では `String.replace()` メソッドと正規表現を使い、シンプルに置換を行っています。

---

## 4. テストの実行

実装が終わったら、テストを走らせてみましょう。

```powershell
npm run test
```

2つのテストに緑色のチェックマーク（✓）が付き、「PASS」と表示されれば成功です！
このように、テスト（仕様）を先に書き、それを満たすコードを書くフローが TDD です。

---

## 🍔 今日のチェックリスト

1. [ ] `day02` フォルダと設定ファイルのコピー完了
2. [ ] テストファイルと実装ファイルの作成・コピペ完了
3. [ ] `npm run test` でPASS（Green）になったことを確認

### Gitコミット（ルート管理への実践）

Day 1でディレクトリの大元をGit管理にしたので、以下のコマンドで今日の作業をコミットしてメインの履歴にプッシュしましょう。

```powershell
# ルートフォルダに移動する
cd C:\dev\ts_practice

# Day 2用の機能ブランチを切る
git checkout -b feature/day02-markdown-cli

# 作業内容をステージに追加してコミット
git add day02-markdown-cli
git commit -m "feat: MarkdownパーサーとTDDの実践"

# メインブランチに統合
git checkout main
git merge feature/day02-markdown-cli

# GitHubに反映（プッシュ）
git push origin main
```

問題なくGitHubに反映されたらDay 2は完了です！お疲れ様でした。
