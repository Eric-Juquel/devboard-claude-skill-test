import { getProjects as getProjectsClient } from '@/api/services/generated/projects';
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from '@/features/projects/schemas/project.schema';
import { projectSchema, projectsResponseSchema } from '@/features/projects/schemas/project.schema';

const client = getProjectsClient();

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await client.getProjects();
    return projectsResponseSchema.parse(data);
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await client.createProject(input);
    return projectSchema.parse(data);
  },

  update: async (id: string, input: UpdateProjectInput): Promise<Project> => {
    const { data } = await client.updateProject(id, input);
    return projectSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await client.deleteProject(id);
  },
};
