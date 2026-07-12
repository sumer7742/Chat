import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { CoupleCodeLock } from '@/components/love/CoupleCodeLock';
import { PersonalizeNickname } from '@/components/love/PersonalizeNickname';

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  useSocketEvents(); // app-wide realtime (messages, presence, nickname sync)
  if (status !== 'authenticated') return <Navigate to="/welcome" replace />;
  // Every app open is gated by the Couple Code (or biometrics), then — once
  // linked — the one-time "Personalize Your Love" nickname flow.
  return (
    <CoupleCodeLock>
      <PersonalizeNickname />
      <Outlet />
    </CoupleCodeLock>
  );
}
