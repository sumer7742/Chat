import { create } from 'zustand';
import type { User } from '@/types';
import { tokenStore } from '@/lib/api';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setStatus: (status: AuthState['status']) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  setAuth: (user, accessToken) => {
    tokenStore.set(accessToken);
    set({ user, status: 'authenticated' });
  },
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  clear: () => {
    tokenStore.set(null);
    set({ user: null, status: 'unauthenticated' });
  },
}));
