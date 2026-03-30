import { Pencil, Trash2 } from 'lucide-react';
import { memo, startTransition, useOptimistic, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDeleteTaskMutation } from '@/api/queries/task.query';
import { EditTaskDialog } from '@/features/tasks/components/EditTaskDialog';
import type { Task } from '@/features/tasks/schemas/task.schema';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface TaskCardProps {
  readonly task: Task;
}

const statusVariantMap = {
  todo: 'outline',
  'in-progress': 'warning',
  done: 'success',
} as const;

const priorityVariantMap = {
  low: 'secondary',
  medium: 'info',
  high: 'destructive',
} as const;

export const TaskCard = memo(function TaskCard({ task }: TaskCardProps) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const deleteTask = useDeleteTaskMutation();

  const [optimisticDeleted, setOptimisticDeleted] = useOptimistic(
    false,
    (_, deleted: boolean) => deleted,
  );

  const handleDelete = () => {
    startTransition(async () => {
      setOptimisticDeleted(true);
      try {
        await deleteTask.mutateAsync(task.id);
        toast.success(t('tasks.form.deleteSuccess'));
      } catch {
        toast.error(t('tasks.form.deleteError'));
      }
    });
  };

  if (optimisticDeleted) return null;

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-start justify-between gap-2'>
          <div className='flex flex-col gap-1.5'>
            <CardTitle className='text-base'>{task.title}</CardTitle>
            <div className='flex flex-wrap gap-1.5'>
              <Badge variant={statusVariantMap[task.status]}>
                {t(`tasks.status.${task.status}`)}
              </Badge>
              <Badge variant={priorityVariantMap[task.priority]}>
                {t(`tasks.priority.${task.priority}`)}
              </Badge>
            </div>
          </div>
          <div className='flex gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setEditOpen(true)}
              aria-label='Edit task'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              aria-label='Delete task'
            >
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        </CardHeader>
        {task.description && (
          <CardContent>
            <CardDescription>{task.description}</CardDescription>
          </CardContent>
        )}
      </Card>

      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
});
