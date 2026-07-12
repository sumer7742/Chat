import { create } from 'zustand';
import {
  DEFAULT_LOVE_CONFIG,
  DEFAULT_SETTINGS,
  applyFont,
  type CoupleEvent,
  type LoveConfig,
  type LoveLetter,
  type LoveSettings,
  type Memory,
  type WishItem,
} from '@/lib/love';

const KEY = 'loveData';

interface Persisted {
  config: LoveConfig;
  letters: LoveLetter[];
  memories: Memory[];
  wishlist: WishItem[];
  events: CoupleEvent[];
  settings: LoveSettings;
}

function load(): Persisted {
  const empty: Persisted = {
    config: DEFAULT_LOVE_CONFIG,
    letters: [],
    memories: [],
    wishlist: [],
    events: [],
    settings: DEFAULT_SETTINGS,
  };
  if (typeof localStorage === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      config: { ...DEFAULT_LOVE_CONFIG, ...(parsed.config ?? {}) },
      letters: parsed.letters ?? [],
      memories: parsed.memories ?? [],
      wishlist: parsed.wishlist ?? [],
      events: parsed.events ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return empty;
  }
}

interface LoveState extends Persisted {
  setConfig: (patch: Partial<LoveConfig>) => void;
  addLetter: (l: Omit<LoveLetter, 'id' | 'createdAt' | 'favorite'>) => void;
  updateLetter: (id: string, patch: Partial<LoveLetter>) => void;
  removeLetter: (id: string) => void;
  addMemory: (m: Omit<Memory, 'id' | 'favorite'>) => void;
  updateMemory: (id: string, patch: Partial<Memory>) => void;
  removeMemory: (id: string) => void;
  addWish: (w: Omit<WishItem, 'id' | 'done'>) => void;
  toggleWish: (id: string) => void;
  removeWish: (id: string) => void;
  addEvent: (e: Omit<CoupleEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  setSettings: (patch: Partial<LoveSettings>) => void;
}

// Monotonic id without Date.now()/Math.random (kept simple + SSR-safe).
let counter = 0;
function newId(): string {
  counter += 1;
  return `${counter}-${new Date().toISOString()}`;
}

export const useLoveStore = create<LoveState>((set, get) => {
  const initial = load();
  if (typeof document !== 'undefined') applyFont(initial.settings.fontId);

  const persist = () => {
    const { config, letters, memories, wishlist, events, settings } = get();
    try {
      localStorage.setItem(KEY, JSON.stringify({ config, letters, memories, wishlist, events, settings }));
    } catch {
      /* storage full / unavailable — ignore */
    }
  };

  return {
    ...initial,

    setConfig: (patch) => {
      set((s) => ({ config: { ...s.config, ...patch } }));
      persist();
    },

    addLetter: (l) => {
      const letter: LoveLetter = { ...l, id: newId(), createdAt: new Date().toISOString(), favorite: false };
      set((s) => ({ letters: [letter, ...s.letters] }));
      persist();
    },
    updateLetter: (id, patch) => {
      set((s) => ({ letters: s.letters.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
      persist();
    },
    removeLetter: (id) => {
      set((s) => ({ letters: s.letters.filter((x) => x.id !== id) }));
      persist();
    },

    addMemory: (m) => {
      const memory: Memory = { ...m, id: newId(), favorite: false };
      set((s) => ({ memories: [memory, ...s.memories] }));
      persist();
    },
    updateMemory: (id, patch) => {
      set((s) => ({ memories: s.memories.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
      persist();
    },
    removeMemory: (id) => {
      set((s) => ({ memories: s.memories.filter((x) => x.id !== id) }));
      persist();
    },

    addWish: (w) => {
      const item: WishItem = { ...w, id: newId(), done: false };
      set((s) => ({ wishlist: [item, ...s.wishlist] }));
      persist();
    },
    toggleWish: (id) => {
      set((s) => ({ wishlist: s.wishlist.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));
      persist();
    },
    removeWish: (id) => {
      set((s) => ({ wishlist: s.wishlist.filter((x) => x.id !== id) }));
      persist();
    },

    addEvent: (e) => {
      const item: CoupleEvent = { ...e, id: newId() };
      set((s) => ({ events: [item, ...s.events] }));
      persist();
    },
    removeEvent: (id) => {
      set((s) => ({ events: s.events.filter((x) => x.id !== id) }));
      persist();
    },

    setSettings: (patch) => {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
      if (patch.fontId) applyFont(patch.fontId);
      persist();
    },
  };
});
