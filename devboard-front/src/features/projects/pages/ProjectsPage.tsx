import { useTranslation } from "react-i18next";
import { useProjectsQuery } from "@/api/queries/project.query";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectForm } from "@/features/projects/components/ProjectForm";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading, isError } = useProjectsQuery();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{t("projects.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("projects.subtitle")}</p>
      </div>

      {isLoading && <p className="text-muted-foreground">{t("projects.loading")}</p>}
      {isError && <p className="text-destructive">{t("projects.error")}</p>}
      {projects?.length === 0 && (
        <p className="text-muted-foreground">{t("projects.empty")}</p>
      )}
      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectForm />
    </div>
  );
}
