import { useState, type ReactNode } from 'react';
import { useLoveStore } from '@/store/loveStore';
import { FloatingHearts } from './FloatingHearts';

/** Session-scoped unlock flag so the PIN is asked once per browser session. */
let unlockedThisSession = false;

/** Gates the Love section behind the on-device PIN, when one is set. */
export function LoveGate({ children }: { children: ReactNode }) {
  const pin = useLoveStore((s) => s.settings.pin);
  const [unlocked, setUnlocked] = useState(unlockedThisSession);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);

  if (!pin || unlocked) return <>{children}</>;

  const submit = (value: string) => {
    if (value === pin) {
      unlockedThisSession = true;
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
      setEntry('');
    }
  };

  const press = (d: string) => {
    const next = (entry + d).slice(0, pin.length);
    setEntry(next);
    if (next.length === pin.length) setTimeout(() => submit(next), 120);
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden love-bg">
      <FloatingHearts count={12} />
      <div className={`relative z-10 flex flex-col items-center ${error ? 'animate-pop-in' : ''}`}>
        <span className="animate-heartbeat text-6xl">🔒</span>
        <h2 className="mt-4 text-xl font-bold love-text">Our private space</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-300">Enter your PIN, my love</p>

        <div className={`mb-6 flex gap-3 ${error ? 'text-red-400' : ''}`}>
          {Array.from({ length: pin.length }).map((_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition ${
                i < entry.length ? 'love-gradient border-transparent' : 'border-princess-purple/40'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => press(d)}
              className="glass-card h-16 w-16 rounded-full text-xl font-semibold text-slate-700 transition active:scale-90 dark:text-slate-100"
            >
              {d}
            </button>
          ))}
          <span />
          <button
            onClick={() => press('0')}
            className="glass-card h-16 w-16 rounded-full text-xl font-semibold text-slate-700 transition active:scale-90 dark:text-slate-100"
          >
            0
          </button>
          <button
            onClick={() => setEntry((e) => e.slice(0, -1))}
            className="grid h-16 w-16 place-items-center rounded-full text-xl text-slate-400"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
