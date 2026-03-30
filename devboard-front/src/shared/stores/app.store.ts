import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Theme } from '@/shared/types/common';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
