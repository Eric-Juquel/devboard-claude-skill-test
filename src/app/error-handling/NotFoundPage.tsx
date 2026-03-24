import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/shared/components/ui/button";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold">{t("errors.notFound.title")}</h2>
      <p className="text-muted-foreground">{t("errors.notFound.description")}</p>
      <Link to="/" className={buttonVariants()}>
        {t("errors.backHome")}
      </Link>
    </div>
  );
}
