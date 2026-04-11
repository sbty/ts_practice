export interface Todo {
    id: number;
    task: string;
    completed: boolean;
}

/**
 * 新規作成時にクライアントから送られてくるデータの形
 */
export interface CreateTodoRequest {
    task: string;
}
