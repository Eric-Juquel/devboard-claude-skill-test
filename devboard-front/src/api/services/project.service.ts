import { apiClient } from "@/api/client/axios.client";
import type {
  CreateProjectInput,
  Project,
  UpdateProjectInput,
} from "@/features/projects/schemas/project.schema";
import {
  projectSchema,
  projectsResponseSchema,
} from "@/features/projects/schemas/project.schema";

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<unknown>("/projects");
    return projectsResponseSchema.parse(data);
  },

  create: async (input: CreateProjectInput): Promise<Project> => {
    const { data } = await apiClient.post<unknown>("/projects", input);
    return projectSchema.parse(data);
  },

  update: async (id: string, input: UpdateProjectInput): Promise<Project> => {
    const { data } = await apiClient.put<unknown>(`/projects/${id}`, input);
    return projectSchema.parse(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
