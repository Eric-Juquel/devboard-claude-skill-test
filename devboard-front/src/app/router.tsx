import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ErrorPage } from '@/app/error-handling/ErrorPage';
import { NotFoundPage } from '@/app/error-handling/NotFoundPage';
import { AppLayout } from '@/app/layout/AppLayout';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ProjectsPage = lazy(() => import('@/features/projects/pages/ProjectsPage'));
const TasksPage = lazy(() => import('@/features/tasks/pages/TasksPage'));

const PageLoader = () => (
  <div className='flex min-h-[60vh] items-center justify-center'>
    <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <HomePage />
            </Suspense>
          </AppLayout>
        ),
      },
      {
        path: 'projects',
        element: (
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <ProjectsPage />
            </Suspense>
          </AppLayout>
        ),
      },
      {
        path: 'tasks',
        element: (
          <AppLayout>
            <Suspense fallback={<PageLoader />}>
              <TasksPage />
            </Suspense>
          </AppLayout>
        ),
      },
      {
        path: '*',
        element: (
          <AppLayout>
            <NotFoundPage />
          </AppLayout>
        ),
      },
    ],
  },
]);
