import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export const projectsResponseSchema = z.array(projectSchema);

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']).default('active'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export const updateProjectSchema = createProjectSchema;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
