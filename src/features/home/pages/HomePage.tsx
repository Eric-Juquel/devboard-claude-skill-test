import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useProjectsQuery } from "@/api/queries/project.query";
import { useTasksQuery } from "@/api/queries/task.query";
import { buttonVariants } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

export default function HomePage() {
  const { t } = useTranslation();
  const { data: projects } = useProjectsQuery();
  const { data: tasks } = useTasksQuery();

  const totalProjects = projects?.length ?? 0;
  const totalTasks = tasks?.length ?? 0;
  const todoTasks = tasks?.filter((task) => task.status === "todo").length ?? 0;
  const inProgressTasks = tasks?.filter((task) => task.status === "in-progress").length ?? 0;
  const doneTasks = tasks?.filter((task) => task.status === "done").length ?? 0;

  const stats = [
    { label: t("home.stats.totalProjects"), value: totalProjects, href: "/projects" },
    { label: t("home.stats.totalTasks"), value: totalTasks, href: "/tasks" },
    { label: t("home.stats.todoTasks"), value: todoTasks, href: "/tasks" },
    { label: t("home.stats.inProgressTasks"), value: inProgressTasks, href: "/tasks" },
    { label: t("home.stats.doneTasks"), value: doneTasks, href: "/tasks" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{t("home.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("home.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href} className="group">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex gap-4">
        <Link to="/projects" className={cn(buttonVariants())}>
          {t("nav.projects")}
        </Link>
        <Link to="/tasks" className={cn(buttonVariants({ variant: "outline" }))}>
          {t("nav.tasks")}
        </Link>
      </div>
    </div>
  );
}
