import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: false,

      toggleTheme: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        if (newDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      initTheme: () => {
        if (get().isDark) {
          document.documentElement.classList.add('dark');
        }
      },
    }),
    { name: 'crm-theme' }
  )
);
