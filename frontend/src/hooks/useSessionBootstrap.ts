import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { tokenStore } from '@/lib/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * On first load there is no in-memory access token (it lives only in memory for
 * XSS safety). We attempt a silent refresh using the httpOnly refresh cookie,
 * then hydrate the current user.
 */
export function useSessionBootstrap() {
  const setStatus = useAuthStore((s) => s.setStatus);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('loading');
      try {
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );
        if (cancelled) return;
        tokenStore.set(data.data.accessToken);
        const user = await authService.me();
        if (cancelled) return;
        setUser(user);
        setStatus('authenticated');
      } catch {
        if (!cancelled) clear();
      }
    })();

    const onLogout = () => clear();
    window.addEventListener('auth:logout', onLogout);
    return () => {
      cancelled = true;
      window.removeEventListener('auth:logout', onLogout);
    };
  }, [setStatus, setUser, clear]);
}
