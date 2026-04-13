export interface Todo {
    id: number;
    task: string;
    completed: number; // SQLite uses 0/1 for boolean
}
