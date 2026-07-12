import { useEffect, useState } from 'react';
import { FloatingHearts } from './FloatingHearts';

/**
 * Premium animated splash shown once per browser session on first load.
 * Fades itself out after a short beat.
 */
export function SplashScreen() {
  const [show, setShow] = useState(() => {
    if (typeof sessionStorage === 'undefined') return true;
    return sessionStorage.getItem('splashShown') !== '1';
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setLeaving(true), 2000);
    const t2 = setTimeout(() => {
      setShow(false);
      try {
        sessionStorage.setItem('splashShown', '1');
      } catch {
        /* ignore */
      }
    }, 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center love-bg transition-opacity duration-700 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <FloatingHearts count={18} />
      <div className="relative z-10 flex flex-col items-center animate-pop-in">
        <div className="grid h-28 w-28 place-items-center rounded-[2rem] love-gradient animate-shimmer shadow-glow">
          <span className="animate-heartbeat text-6xl">💖</span>
        </div>
        <h1 className="mt-6 font-script text-4xl love-text">Only for My Princess</h1>
        <p className="mt-1 text-sm tracking-widest text-princess-purple">MADE WITH LOVE ❤️</p>
        <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/40">
          <div className="h-full w-full love-gradient animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
