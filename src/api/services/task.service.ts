import { apiClient } from "@/api/client/axios.client";
import type { CreateTaskInput, Task, UpdateTaskInput } from "@/features/tasks/schemas/task.schema";
import { taskSchema, tasksResponseSchema } from "@/features/tasks/schemas/task.schema";

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const { data } = await apiClient.get<unknown>("/tasks");
    return tasksResponseSchema.parse(data);
  },

  create: async (input: CreateTaskInput): Promise<Task> => {
    const { data } = await apiClient.post<unknown>("/tasks", input);
    return taskSchema.parse(data);
  },

  update: async (id: string, input: UpdateTaskInput): Promise<Task> => {
    const { data } = await apiClient.put<unknown>(`/tasks/${id}`, input);
    return taskSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
