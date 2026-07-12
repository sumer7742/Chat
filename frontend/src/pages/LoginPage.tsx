import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { apiErrorMessage } from '@/lib/api';
import { biometricAvailable, biometricVerify } from '@/lib/biometric';
import { markUnlocked } from '@/lib/coupleLock';

const REMEMBER_KEY = 'rememberedIdentifier';

export default function LoginPage() {
  const { login } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
  const [loading, setLoading] = useState(false);
  const [bioReady, setBioReady] = useState(false);

  useEffect(() => {
    biometricAvailable().then((ok) => setBioReady(ok && !!localStorage.getItem(REMEMBER_KEY)));
  }, []);

  const persistRemember = () => {
    if (remember) localStorage.setItem(REMEMBER_KEY, identifier.trim());
    else localStorage.removeItem(REMEMBER_KEY);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier.trim(), password);
      persistRemember();
      markUnlocked();
      navigate('/');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Biometric = verify locally, then resume an existing session via the cookie.
  const unlockWithBiometric = async () => {
    const verified = await biometricVerify();
    if (!verified) return toast('Use your password to sign in this time 💗', { icon: '🔒' });
    try {
      const user = await authService.me();
      setUser(user);
      markUnlocked();
      navigate('/');
    } catch {
      toast('Session expired — please sign in with your password 💌', { icon: '🔑' });
    }
  };

  return (
    <AuthLayout title="Welcome back, my love" subtitle="Sign in to our little world">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com"
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-princess-pink" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium love-text">Forgot password?</Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="heart-btn flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold text-white transition disabled:opacity-60"
        >
          {loading && <Spinner size={18} className="text-white" />}
          Sign in 💖
        </button>

        {bioReady && (
          <button
            type="button"
            onClick={unlockWithBiometric}
            className="glass-card flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium text-princess-purple transition active:scale-[0.98]"
          >
            <span className="text-lg">🫆</span> Unlock with Face ID / Fingerprint
          </button>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
        New here?{' '}
        <Link to="/welcome" className="font-semibold love-text">Start our journey ❤️</Link>
      </p>
    </AuthLayout>
  );
}
