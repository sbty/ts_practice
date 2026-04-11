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
