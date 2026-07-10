import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  activeChatId: string | null;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveChat: (id: string | null) => void;
}

function initialTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark';
  return 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: initialTheme(),
  sidebarOpen: true,
  activeChatId: null,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveChat: (activeChatId) => set({ activeChatId }),
}));
