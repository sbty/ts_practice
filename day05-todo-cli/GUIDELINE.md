# Day 5: インタラクティブ・タスク管理ツール (Todo CLI)

本日は、これまでの知識（ファイル操作、非同期処理、型定義）を総動員して、実際に使える**対話型CLIツール**を作成します。
ユーザーがメニューを選択し、タスクを追加したり削除したりできる、より「アプリらしい」開発を体験しましょう！

---

## 1. 環境構築とパッケージのインストール

まずは `inquirer` という、ターミナルで対話型のUI（選択肢や入力フォーム）を簡単に作れるライブラリを導入します。
さらに、最新の TypeScript をスムーズに実行するために `tsx` も追加します。

```powershell
# day05 フォルダ内で実行
npm install inquirer
npm install -D @types/inquirer tsx
```

また、今回は最新の JavaScript 形式 (ES Modules) を利用するため、`package.json` に一行追加します。

**📄 `package.json` (一部修正)**
```json
{
  "type": "module",
  ...
}
```

---

## 2. データの型を定義する

`src` フォルダ内に `types.ts` を作成します。どのようなデータを扱うかを明確にします。

**📄 `src/types.ts`**
```typescript
/**
 * Todoアイテム一個分のデータ構造
 */
export interface Todo {
    id: number;
    task: string;
    completed: boolean;
}
```

---

## 3. ストレージ（保存）ロジックの実装

データをファイルに保存したり読み込んだりする「中身のロジック」を、表示（UI）と切り離して作成します。これを「関心の分離」と呼び、大規模な開発で非常に重要になります。

**📄 `src/storage.ts`**
```typescript
import * as fs from 'fs/promises';
import { Todo } from './types.js'; // ※ ESMでは拡張子 .js が必要です

const FILE_PATH = './tasks.json';

export class TodoStorage {
    /**
     * ファイルからTodoリストを読み込む
     */
    async load(): Promise<Todo[]> {
        try {
            const data = await fs.readFile(FILE_PATH, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            // ファイルがない場合は空のリストを返す
            return [];
        }
    }

    /**
     * Todoリストをファイルに保存する
     */
    async save(todos: Todo[]): Promise<void> {
        await fs.writeFile(FILE_PATH, JSON.stringify(todos, null, 2));
    }
}
```

---

## 4. メインプログラム（対話型UI）の実装

最後に、ユーザーと対話するためのメインループを作成します。

**📄 `src/index.ts`**
```typescript
import inquirer from 'inquirer';
import { TodoStorage } from './storage.js';
import { Todo } from './types.js';

const storage = new TodoStorage();

async function mainMenu() {
    const todos = await storage.load();

    // ユーザーにメニューを提示
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: `現在 ${todos.length} 個のタスクがあります。何をしますか？`,
            choices: [
                'タスク一覧を表示',
                'タスクを追加',
                'タスクを削除',
                '終了'
            ]
        }
    ]);

    switch (action) {
        case 'タスク一覧を表示':
            console.table(todos);
            break;

        case 'タスクを追加':
            const { taskName } = await inquirer.prompt([
                { type: 'input', name: 'taskName', message: 'タスク名を入力してください:' }
            ]);
            const newTodo: Todo = { id: Date.now(), task: taskName, completed: false };
            todos.push(newTodo);
            await storage.save(todos);
            console.log('✅ 追加しました！');
            break;

        case 'タスクを削除':
            if (todos.length === 0) {
                console.log('削除するタスクがありません。');
                break;
            }
            const { deleteId } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'deleteId',
                    message: '削除するタスクを選択:',
                    choices: todos.map(t => ({ name: t.task, value: t.id }))
                }
            ]);
            const filtered = todos.filter(t => t.id !== deleteId);
            await storage.save(filtered);
            console.log('🗑️ 削除しました。');
            break;

        case '終了':
            console.log('お疲れ様でした！');
            process.exit();
    }

    // 再帰的に自分を呼んでループさせる
    mainMenu();
}

console.log('🚀 Todo CLI アプリへようこそ！');
mainMenu();
```

---

## 5. 実行してみよう！

以下のコマンドで実行します！

```powershell
npx tsx src/index.ts
```
> ※ `tsx` を使うと、ESMのプロジェクトでも複雑な設定なしに実行できます。

メニューを矢印キーで操作して、タスクの追加や削除ができることを確認してください。
一度終了して再度立ち上げても、タスクが残っていれば大成功です！🎉
