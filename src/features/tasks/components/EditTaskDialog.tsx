import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUpdateTaskMutation } from "@/api/queries/task.query";
import { useProjectsQuery } from "@/api/queries/project.query";
import {
  updateTaskSchema,
  type Task,
  type UpdateTaskInput,
} from "@/features/tasks/schemas/task.schema";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface EditTaskDialogProps {
  readonly task: Task;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const { t } = useTranslation();
  const updateTask = useUpdateTaskMutation();
  const { data: projects } = useProjectsQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (data: UpdateTaskInput) => {
    try {
      await updateTask.mutateAsync({ id: task.id, input: data });
      toast.success(t("tasks.form.updateSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("tasks.form.updateError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tasks.form.editTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-task-title">{t("tasks.form.title")}</Label>
            <Input
              id="edit-task-title"
              placeholder={t("tasks.form.titlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{t("tasks.form.titleMin")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-task-description">{t("tasks.form.description")}</Label>
            <Input
              id="edit-task-description"
              placeholder={t("tasks.form.descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="edit-task-status">{t("tasks.form.status")}</Label>
              <select
                id="edit-task-status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("status")}
              >
                <option value="todo">{t("tasks.status.todo")}</option>
                <option value="in-progress">{t("tasks.status.in-progress")}</option>
                <option value="done">{t("tasks.status.done")}</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="edit-task-priority">{t("tasks.form.priority")}</Label>
              <select
                id="edit-task-priority"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("priority")}
              >
                <option value="low">{t("tasks.priority.low")}</option>
                <option value="medium">{t("tasks.priority.medium")}</option>
                <option value="high">{t("tasks.priority.high")}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-task-project">{t("tasks.form.projectId")}</Label>
            <select
              id="edit-task-project"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("projectId")}
            >
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("tasks.form.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {t("tasks.form.update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
