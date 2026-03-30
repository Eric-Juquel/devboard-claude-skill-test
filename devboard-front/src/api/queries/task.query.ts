import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/api/services/task.service';
import type { CreateTaskInput, UpdateTaskInput } from '@/features/tasks/schemas/task.schema';

const QUERY_KEY = ['tasks'] as const;

export const tasksQueryOptions = queryOptions({
  queryKey: QUERY_KEY,
  queryFn: taskService.getAll,
});

export const useTasksQuery = () => useQuery(tasksQueryOptions);

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      taskService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
