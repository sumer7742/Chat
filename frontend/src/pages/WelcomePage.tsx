import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FloatingHearts } from '@/components/love/FloatingHearts';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [code, setCode] = useState('');

  const join = () => {
    const c = code.trim().toUpperCase();
    if (c.length < 4) return;
    navigate(`/invite/${encodeURIComponent(c)}`);
  };

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden love-bg p-6 text-center">
      <FloatingHearts count={18} />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center animate-fade-in">
        <div className="mb-6 grid h-32 w-32 place-items-center rounded-[2.5rem] love-gradient animate-shimmer shadow-glow">
          <span className="animate-heartbeat text-7xl">💖</span>
        </div>

        <h1 className="font-script text-5xl love-text">Only for My Princess</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          A private universe for just the two of us. No strangers. No noise. Only love. 💌
        </p>

        {!showJoin ? (
          <>
            <button
              onClick={() => navigate('/register')}
              className="heart-btn mt-8 w-full rounded-2xl py-4 text-base font-semibold text-white transition"
            >
              ❤️ Create Our Private Space
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="glass-card mt-3 w-full rounded-2xl py-3.5 text-sm font-medium text-princess-purple transition active:scale-[0.98]"
            >
              💌 I have an invite code
            </button>
          </>
        ) : (
          <div className="glass-card mt-8 w-full p-5">
            <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-200">Enter your partner&apos;s code</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && join()}
              placeholder="LOVE-XXXX"
              autoFocus
              className="mb-3 w-full rounded-xl border-2 border-princess-pink/30 bg-white/70 px-3 py-3 text-center text-xl font-bold tracking-widest outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
            />
            <button onClick={join} className="heart-btn w-full rounded-xl py-3 font-semibold text-white">
              Continue 💕
            </button>
            <button onClick={() => setShowJoin(false)} className="mt-2 text-xs text-slate-400">
              ← Back
            </button>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400">
          Returning on a new device?{' '}
          <Link to="/signin" className="font-medium text-princess-purple">Sign in once</Link>
        </p>
      </div>
    </div>
  );
}
