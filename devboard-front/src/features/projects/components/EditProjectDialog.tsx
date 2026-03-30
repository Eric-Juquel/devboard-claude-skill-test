import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUpdateProjectMutation } from "@/api/queries/project.query";
import {
  updateProjectSchema,
  type Project,
  type UpdateProjectInput,
} from "@/features/projects/schemas/project.schema";
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

interface EditProjectDialogProps {
  readonly project: Project;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const { t } = useTranslation();
  const updateProject = useUpdateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectInput>({
    // biome-ignore lint/suspicious/noExplicitAny: prevents TS2589 deep instantiation with Zod default fields
    resolver: zodResolver(updateProjectSchema as any),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      status: project.status,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        description: project.description ?? "",
        status: project.status,
      });
    }
  }, [open, project, reset]);

  const onSubmit = async (data: UpdateProjectInput) => {
    try {
      await updateProject.mutateAsync({ id: project.id, input: data });
      toast.success(t("projects.form.updateSuccess"));
      onOpenChange(false);
    } catch {
      toast.error(t("projects.form.updateError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t("projects.form.editTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-project-name">{t("projects.form.name")}</Label>
            <Input
              id="edit-project-name"
              placeholder={t("projects.form.namePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{t("projects.form.nameMin")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-project-description">{t("projects.form.description")}</Label>
            <Input
              id="edit-project-description"
              placeholder={t("projects.form.descriptionPlaceholder")}
              {...register("description")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("projects.form.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {t("projects.form.update")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
