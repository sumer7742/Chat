import { useEffect, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { coupleService } from '@/services/couple.service';
import { Spinner } from '@/components/ui/Spinner';
import { FloatingHearts } from './FloatingHearts';
import { biometricAvailable, biometricVerify } from '@/lib/biometric';
import {
  isUnlocked,
  markUnlocked,
  biometricEnabled,
  setBiometricEnabled,
} from '@/lib/coupleLock';

/**
 * Full-screen lock shown on every app open for a signed-in user. Unlock with the
 * Couple Code or biometrics; a wrong code plays an elegant shake. Sits over the
 * whole authenticated app.
 */
export function CoupleCodeLock({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(!isUnlocked());
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);
  const [bioReady, setBioReady] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const triedBio = useRef(false);

  const unlock = () => {
    markUnlocked();
    setOpen(false);
  };

  const tryBiometric = async () => {
    const ok = await biometricVerify();
    if (ok) unlock();
    return ok;
  };

  useEffect(() => {
    if (!open) return;
    biometricAvailable().then((ok) => {
      const enabled = ok && biometricEnabled();
      setBioReady(ok);
      // Auto-prompt biometrics once if the user opted in.
      if (enabled && !triedBio.current) {
        triedBio.current = true;
        tryBiometric();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async () => {
    if (code.trim().length < 4 || checking) return;
    setChecking(true);
    try {
      const valid = await coupleService.verifyCode(code.trim());
      if (valid) {
        if (bioReady && !biometricEnabled()) setBiometricEnabled(true); // offer faster unlock next time
        unlock();
      } else {
        setError(true);
        setCode('');
        setTimeout(() => setError(false), 600);
      }
    } catch {
      toast.error('Could not verify — try again 💗');
    } finally {
      setChecking(false);
    }
  };

  const forgot = async () => {
    try {
      const couple = await coupleService.get();
      setRevealed(couple.inviteCode);
    } catch {
      toast.error('Could not fetch your code');
    }
  };

  if (!open) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden love-bg p-6">
      <FloatingHearts count={14} />

      <div className={`relative z-10 w-full max-w-xs text-center ${error ? 'animate-[pop-in_.4s]' : ''}`}>
        <div className="mb-3 text-6xl animate-heartbeat">❤️</div>
        <h1 className="font-script text-4xl love-text">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Enter your Couple Code</p>

        <div
          className={`glass-card mt-6 p-5 transition ${error ? 'ring-2 ring-red-400' : ''}`}
          style={error ? { animation: 'pop-in .3s' } : undefined}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="LOVE-XXXX"
            autoFocus
            className={`w-full rounded-xl border-2 bg-white/70 px-3 py-3 text-center text-xl font-bold tracking-[0.2em] outline-none transition dark:bg-white/10 dark:text-slate-100 ${
              error ? 'border-red-400 text-red-400' : 'border-princess-pink/30 focus:ring-2 focus:ring-princess-pink/40'
            }`}
          />
          {error && <p className="mt-2 text-xs font-medium text-red-400">That code doesn&apos;t match 💔</p>}

          <button
            onClick={submit}
            disabled={checking}
            className="heart-btn mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white disabled:opacity-60"
          >
            {checking && <Spinner size={16} className="text-white" />}
            Unlock ❤️
          </button>

          {bioReady && (
            <button
              onClick={tryBiometric}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-princess-purple"
            >
              <span className="text-lg">🫆</span> Use Face ID / Fingerprint
            </button>
          )}
        </div>

        <button onClick={forgot} className="mt-4 text-sm text-slate-400 hover:text-princess-purple">
          Forgot Couple Code?
        </button>

        {revealed && (
          <div className="glass-card mt-3 p-4 text-sm">
            <p className="text-slate-500 dark:text-slate-300">Your Couple Code is</p>
            <p className="mt-1 text-2xl font-extrabold tracking-widest love-text">{revealed}</p>
          </div>
        )}
      </div>
    </div>
  );
}
