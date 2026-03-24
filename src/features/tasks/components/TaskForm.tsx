import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateTaskMutation } from "@/api/queries/task.query";
import { useProjectsQuery } from "@/api/queries/project.query";
import { createTaskSchema } from "@/features/tasks/schemas/task.schema";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type FormErrors = {
  title?: string[];
  projectId?: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      {t("tasks.form.submit")}
    </Button>
  );
}

export function TaskForm() {
  const { t } = useTranslation();
  const createTask = useCreateTaskMutation();
  const { data: projects } = useProjectsQuery();

  const [errors, formAction] = useActionState(
    async (_prev: FormErrors, formData: FormData): Promise<FormErrors> => {
      const result = createTaskSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description") || undefined,
        status: formData.get("status") || "todo",
        priority: formData.get("priority") || "medium",
        projectId: formData.get("projectId"),
      });

      if (!result.success) {
        return result.error.flatten().fieldErrors;
      }

      try {
        await createTask.mutateAsync(result.data);
        toast.success(t("tasks.form.success"));
        return {};
      } catch {
        toast.error(t("tasks.error"));
        return {};
      }
    },
    {}
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("tasks.form.addTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">{t("tasks.form.title")}</Label>
            <Input
              id="task-title"
              name="title"
              placeholder={t("tasks.form.titlePlaceholder")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{t("tasks.form.titleMin")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-description">{t("tasks.form.description")}</Label>
            <Input
              id="task-description"
              name="description"
              placeholder={t("tasks.form.descriptionPlaceholder")}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="task-status">{t("tasks.form.status")}</Label>
              <select
                id="task-status"
                name="status"
                defaultValue="todo"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="todo">{t("tasks.status.todo")}</option>
                <option value="in-progress">{t("tasks.status.in-progress")}</option>
                <option value="done">{t("tasks.status.done")}</option>
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="task-priority">{t("tasks.form.priority")}</Label>
              <select
                id="task-priority"
                name="priority"
                defaultValue="medium"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="low">{t("tasks.priority.low")}</option>
                <option value="medium">{t("tasks.priority.medium")}</option>
                <option value="high">{t("tasks.priority.high")}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-project">{t("tasks.form.projectId")}</Label>
            <select
              id="task-project"
              name="projectId"
              defaultValue=""
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>
                {t("tasks.form.selectProject")}
              </option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-sm text-destructive">{t("tasks.form.projectId")}</p>
            )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
