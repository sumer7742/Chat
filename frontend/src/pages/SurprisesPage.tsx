import { useState } from 'react';
import { LoveLayout } from '@/layouts/LoveLayout';
import { COMPLIMENTS, SURPRISES } from '@/lib/love';

interface Reveal {
  emoji: string;
  title: string;
  message: string;
}

/** A short-lived full-screen burst of emoji when a surprise is opened. */
function Burst({ emoji }: { emoji: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => {
        const left = Math.random() * 100;
        const dur = 1.6 + Math.random() * 1.4;
        const delay = Math.random() * 0.4;
        const size = 18 + Math.random() * 26;
        return (
          <span
            key={i}
            className="absolute bottom-[-40px] animate-heart-rise"
            style={{
              left: `${left}%`,
              fontSize: `${size}px`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

export default function SurprisesPage() {
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [burst, setBurst] = useState<string | null>(null);
  const [compliment, setCompliment] = useState<string | null>(null);

  const open = (s: Reveal) => {
    setReveal(s);
    setBurst(s.emoji);
    setTimeout(() => setBurst(null), 2600);
  };

  const surprise = () => {
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]!;
    setCompliment(c);
    setBurst('💖');
    setTimeout(() => setBurst(null), 2600);
  };

  return (
    <LoveLayout title="Surprises 🎁" subtitle="A little something to make her smile">
      {burst && <Burst emoji={burst} />}

      {/* Random compliment generator */}
      <div className="glass-card mb-5 overflow-hidden p-6 text-center">
        <p className="mb-2 text-sm font-medium text-princess-purple">Tap for a little love 💕</p>
        <p className="min-h-[3.5rem] font-script text-2xl leading-snug text-slate-700 dark:text-slate-100">
          {compliment ?? 'Press the heart and let me tell you something…'}
        </p>
        <button onClick={surprise} className="heart-btn mt-4 animate-heartbeat rounded-full px-6 py-3 text-white">
          💗 Surprise me
        </button>
      </div>

      {/* Gift grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SURPRISES.map((s) => (
          <button
            key={s.id}
            onClick={() => open(s)}
            className="glass-card group flex flex-col items-center gap-1 p-5 transition hover:-translate-y-1"
          >
            <span className="text-4xl transition group-hover:scale-110">{s.emoji}</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-200">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Reveal modal */}
      {reveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setReveal(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="glass-card relative z-10 max-w-sm animate-pop-in p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-7xl">{reveal.emoji}</div>
            <h3 className="mb-1 text-xl font-bold love-text">{reveal.title}</h3>
            <p className="font-script text-xl text-slate-700 dark:text-slate-100">{reveal.message}</p>
            <button onClick={() => setReveal(null)} className="heart-btn mt-5 rounded-full px-6 py-2.5 text-white">
              Aww 🥰
            </button>
          </div>
        </div>
      )}
    </LoveLayout>
  );
}
