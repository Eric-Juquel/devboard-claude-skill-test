import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { buttonVariants } from '@/shared/components/ui/button';

export function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();

  let errorMessage: string;
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = t('errors.description');
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground'>
      <h1 className='text-4xl font-bold'>{t('errors.title')}</h1>
      <p className='text-muted-foreground'>{errorMessage}</p>
      <Link to='/' className={buttonVariants()}>
        {t('errors.backHome')}
      </Link>
    </div>
  );
}
