import { create } from 'zustand';
import { DEFAULT_THEME_ID, DEFAULT_CHAT_BG_ID, applyThemeVars, applyChatBg, themeById } from '@/lib/themes';

type Theme = 'light' | 'dark';

const THEME_KEY = 'themeId';
const CHAT_BG_KEY = 'chatBgId';

interface UIState {
  theme: Theme;
  themeId: string;
  chatBgId: string;
  sidebarOpen: boolean;
  activeChatId: string | null;
  toggleTheme: () => void;
  setThemeId: (id: string) => void;
  setChatBgId: (id: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveChat: (id: string | null) => void;
}

function initialTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) return 'dark';
  return 'light';
}

function initialThemeId(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME_ID;
  return localStorage.getItem(THEME_KEY) ?? DEFAULT_THEME_ID;
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
}

function initialChatBgId(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_CHAT_BG_ID;
  return localStorage.getItem(CHAT_BG_KEY) ?? DEFAULT_CHAT_BG_ID;
}

// Apply the persisted color theme + chat wallpaper immediately on module load.
const startupThemeId = initialThemeId();
const startupChatBgId = initialChatBgId();
if (typeof document !== 'undefined') {
  applyThemeVars(themeById(startupThemeId));
  applyChatBg(startupChatBgId);
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: initialTheme(),
  themeId: startupThemeId,
  chatBgId: startupChatBgId,
  sidebarOpen: true,
  activeChatId: null,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  setThemeId: (id) => {
    applyThemeVars(themeById(id));
    localStorage.setItem(THEME_KEY, id);
    set({ themeId: id });
  },
  setChatBgId: (id) => {
    applyChatBg(id);
    localStorage.setItem(CHAT_BG_KEY, id);
    set({ chatBgId: id });
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveChat: (activeChatId) => set({ activeChatId }),
}));
