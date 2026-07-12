import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Handles /invite/:code — the partner's entry point.
 * - Not signed in → carry the code into partner signup.
 * - Already signed in → hand off to the couple screen to link with the code.
 */
export default function InvitePage() {
  const { code = '' } = useParams();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (code) sessionStorage.setItem('pendingInvite', code.toUpperCase());
  }, [code]);

  if (status === 'loading' || status === 'idle') return null;

  if (status === 'authenticated') {
    return <Navigate to={`/couple?invite=${encodeURIComponent(code.toUpperCase())}`} replace />;
  }
  return <Navigate to={`/register?invite=${encodeURIComponent(code.toUpperCase())}`} replace />;
}
