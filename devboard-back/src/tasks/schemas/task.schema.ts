import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const taskStatusSchema = z.enum(['todo', 'in-progress', 'done']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(['low', 'medium', 'high']);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

// ── Full entity schema (API response shape) ───────────────────────────────────

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  projectId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Task = z.infer<typeof taskSchema>;

// ── Write schemas (request body shapes) ──────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  projectId: z.string().uuid('projectId must be a valid UUID'),
});

export const updateTaskSchema = createTaskSchema.partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
