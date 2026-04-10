import inquirer from 'inquirer';
import { TodoStorage } from './storage.js';
import { Todo } from './types.js';

const storage = new TodoStorage();

async function mainMenu() {
    const todos = await storage.load();

    const { action } = await inquirer.prompt([
        {
            type: 'rawlist',
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
                    type: 'rawlist',
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

    mainMenu();
}

console.log('🚀 Todo CLI アプリへようこそ！');
mainMenu();
