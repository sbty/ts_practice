import { z } from 'zod';

export const CreateTodoSchema = z.object({
    task: z.string()
           .min(3, { message: "タスク名は3文字以上で入力してください" })
           .max(100, { message: "タスク名が長すぎます" }),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
