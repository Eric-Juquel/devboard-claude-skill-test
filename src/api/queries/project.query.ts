import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/api/services/project.service";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/features/projects/schemas/project.schema";

const QUERY_KEY = ["projects"] as const;

export const projectsQueryOptions = queryOptions({
  queryKey: QUERY_KEY,
  queryFn: projectService.getAll,
});

export const useProjectsQuery = () => useQuery(projectsQueryOptions);

export const useCreateProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteProjectMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
