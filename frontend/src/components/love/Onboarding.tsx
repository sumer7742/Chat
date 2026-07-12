import { useState } from 'react';
import { useLoveStore } from '@/store/loveStore';
import { Button } from '@/components/ui/Button';
import { FloatingHearts } from './FloatingHearts';

const STEPS = 2;

/**
 * First-run flow for the couple's key date. Naming is handled separately by the
 * nickname system, so this only welcomes + captures when your story began.
 * Renders only until `settings.onboarded` is set.
 */
export function Onboarding() {
  const { config, setConfig, settings, setSettings } = useLoveStore();
  const [step, setStep] = useState(0);
  const [firstMeet, setFirstMeet] = useState(config.firstMeet);

  if (settings.onboarded) return null;

  const finish = () => {
    setConfig({ firstMeet });
    setSettings({ onboarded: true });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden love-bg p-6">
      <FloatingHearts count={14} />
      <div className="glass-card relative z-10 w-full max-w-sm animate-pop-in p-7 text-center">
        {step === 0 && (
          <>
            <div className="mb-3 text-6xl animate-heartbeat">💝</div>
            <h2 className="text-2xl font-bold love-text">Welcome, my love</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              I built a little world just for us. Let&apos;s make it ours in a couple of taps.
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <div className="mb-3 text-5xl">💫</div>
            <h2 className="mb-2 text-xl font-bold love-text">When did our story begin?</h2>
            <p className="mb-4 text-xs text-slate-400">The day we first met</p>
            <input
              type="date"
              value={firstMeet}
              onChange={(e) => setFirstMeet(e.target.value)}
              className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2.5 text-center text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
            />
          </>
        )}

        {/* dots */}
        <div className="my-5 flex justify-center gap-1.5">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 love-gradient' : 'w-1.5 bg-princess-purple/30'}`} />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="flex-1">Back</Button>
          )}
          {step < STEPS - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} className="flex-1">Continue 💕</Button>
          ) : (
            <Button onClick={finish} className="flex-1">Enter our world 💖</Button>
          )}
        </div>
        {step === 0 && (
          <button onClick={finish} className="mt-3 text-xs text-slate-400 hover:text-princess-purple">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
