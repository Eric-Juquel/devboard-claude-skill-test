import { type ReactNode, useEffect } from 'react';
import { Toaster } from 'sonner';
import { Header } from '@/app/layout/Header';
import { useAppStore } from '@/shared/stores/app.store';

interface AppLayoutProps {
  readonly children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Header />
      <main className='container mx-auto px-4 py-8'>{children}</main>
      <Toaster theme={theme} richColors closeButton position='bottom-right' />
    </div>
  );
}
