import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { disconnectSocket } from '@/lib/socket';
import { queryClient } from '@/lib/queryClient';

export function useAuth() {
  const { user, status, setAuth, setUser, clear } = useAuthStore();

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { user, accessToken } = await authService.login(identifier, password);
      setAuth(user, accessToken);
      return user;
    },
    [setAuth],
  );

  const register = useCallback(
    async (input: { email: string; username: string; displayName: string; password: string; avatarUrl?: string }) => {
      const { user, accessToken } = await authService.register(input);
      setAuth(user, accessToken);
      return user;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      disconnectSocket();
      queryClient.clear();
      clear();
    }
  }, [clear]);

  return { user, status, isAuthenticated: status === 'authenticated', login, register, logout, setUser };
}
