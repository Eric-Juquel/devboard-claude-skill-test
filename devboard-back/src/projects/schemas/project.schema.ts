import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const projectStatusSchema = z.enum(['active', 'completed', 'archived']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

// ── Full entity schema (API response shape) ───────────────────────────────────

export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  status: projectStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof projectSchema>;

// ── Write schemas (request body shapes) ──────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: projectStatusSchema.default('active'),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
