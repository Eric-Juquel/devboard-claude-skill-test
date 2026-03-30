import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  projectId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Task = z.infer<typeof taskSchema>;
export const tasksResponseSchema = z.array(taskSchema);

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  projectId: z.string().min(1, 'Project is required'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
