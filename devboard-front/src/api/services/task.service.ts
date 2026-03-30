import { getTasks as getTasksClient } from '@/api/services/generated/tasks';
import type { CreateTaskInput, Task, UpdateTaskInput } from '@/features/tasks/schemas/task.schema';
import { taskSchema, tasksResponseSchema } from '@/features/tasks/schemas/task.schema';

const client = getTasksClient();

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await client.getTasks();
    return tasksResponseSchema.parse(data);
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await client.createTask(input);
    return taskSchema.parse(data);
  },

  update: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await client.updateTask(id, input);
    return taskSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await client.deleteTask(id);
  },
};
