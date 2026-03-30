import { Pencil, Trash2 } from 'lucide-react';
import { memo, startTransition, useOptimistic, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDeleteProjectMutation } from '@/api/queries/project.query';
import { EditProjectDialog } from '@/features/projects/components/EditProjectDialog';
import type { Project } from '@/features/projects/schemas/project.schema';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

interface ProjectCardProps {
  readonly project: Project;
}

const statusVariantMap = {
  active: 'success',
  completed: 'info',
  archived: 'secondary',
} as const;

export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const deleteProject = useDeleteProjectMutation();

  const [optimisticDeleted, setOptimisticDeleted] = useOptimistic(
    false,
    (_, deleted: boolean) => deleted,
  );

  const handleDelete = () => {
    startTransition(async () => {
      setOptimisticDeleted(true);
      try {
        await deleteProject.mutateAsync(project.id);
        toast.success(t('projects.form.deleteSuccess'));
      } catch {
        toast.error(t('projects.form.deleteError'));
      }
    });
  };

  if (optimisticDeleted) return null;

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-start justify-between gap-2'>
          <div className='flex flex-col gap-1'>
            <CardTitle>{project.name}</CardTitle>
            <Badge variant={statusVariantMap[project.status]}>
              {t(`projects.status.${project.status}`)}
            </Badge>
          </div>
          <div className='flex gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setEditOpen(true)}
              aria-label='Edit project'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleDelete}
              disabled={deleteProject.isPending}
              aria-label='Delete project'
            >
              <Trash2 className='h-4 w-4 text-destructive' />
            </Button>
          </div>
        </CardHeader>
        {project.description && (
          <CardContent>
            <CardDescription>{project.description}</CardDescription>
          </CardContent>
        )}
      </Card>

      <EditProjectDialog project={project} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
});
