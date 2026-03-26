import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useCreateProjectMutation } from "@/api/queries/project.query";
import { createProjectSchema } from "@/features/projects/schemas/project.schema";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type FormErrors = {
  name?: string[];
  description?: string[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      {t("projects.form.submit")}
    </Button>
  );
}

export function ProjectForm() {
  const { t } = useTranslation();
  const createProject = useCreateProjectMutation();

  const [errors, formAction] = useActionState(
    async (_prev: FormErrors, formData: FormData): Promise<FormErrors> => {
      const result = createProjectSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description") || undefined,
        status: "active",
      });

      if (!result.success) {
        return result.error.flatten().fieldErrors;
      }

      try {
        await createProject.mutateAsync(result.data);
        toast.success(t("projects.form.success"));
        return {};
      } catch {
        toast.error(t("projects.error"));
        return {};
      }
    },
    {}
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("projects.form.addTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">{t("projects.form.name")}</Label>
            <Input
              id="project-name"
              name="name"
              placeholder={t("projects.form.namePlaceholder")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{t("projects.form.nameMin")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-description">{t("projects.form.description")}</Label>
            <Input
              id="project-description"
              name="description"
              placeholder={t("projects.form.descriptionPlaceholder")}
            />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
