import { useTranslation } from "react-i18next";
import { useTasksQuery } from "@/api/queries/task.query";
import { TaskCard } from "@/features/tasks/components/TaskCard";
import { TaskForm } from "@/features/tasks/components/TaskForm";

export default function TasksPage() {
  const { t } = useTranslation();
  const { data: tasks, isLoading, isError } = useTasksQuery();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{t("tasks.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("tasks.subtitle")}</p>
      </div>

      {isLoading && <p className="text-muted-foreground">{t("tasks.loading")}</p>}
      {isError && <p className="text-destructive">{t("tasks.error")}</p>}
      {tasks?.length === 0 && <p className="text-muted-foreground">{t("tasks.empty")}</p>}
      {tasks && tasks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <TaskForm />
    </div>
  );
}
