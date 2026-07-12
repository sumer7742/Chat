import { useState } from 'react';
import { NICKNAME_PRESETS, NICKNAME_MAX } from '@/lib/nicknames';
import { cn } from '@/lib/utils';

/**
 * Grid of preset nickname cards + a custom field. Calls onSave with the chosen
 * value. Reused by the onboarding overlay and Settings → Relationship.
 */
export function NicknamePicker({
  initial = '',
  saving,
  onSave,
  ctaLabel = 'Save 💖',
}: {
  initial?: string;
  saving?: boolean;
  onSave: (nickname: string) => void;
  ctaLabel?: string;
}) {
  const presetMatch = NICKNAME_PRESETS.includes(initial) ? initial : '';
  const [selected, setSelected] = useState(presetMatch);
  const [custom, setCustom] = useState(presetMatch ? '' : initial);

  const value = (custom.trim() || selected).slice(0, NICKNAME_MAX);
  const canSave = value.length > 0 && !saving;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {NICKNAME_PRESETS.map((n) => {
          const active = selected === n && !custom.trim();
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                setSelected(n);
                setCustom('');
              }}
              className={cn(
                'rounded-2xl border p-3 text-sm font-medium transition active:scale-95',
                active
                  ? 'love-gradient border-transparent text-white shadow-glow'
                  : 'glass-card border-transparent text-slate-600 hover:-translate-y-0.5 dark:text-slate-200',
              )}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-princess-purple">Or write your own 💫</label>
        <input
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value.slice(0, NICKNAME_MAX));
            setSelected('');
          }}
          maxLength={NICKNAME_MAX}
          placeholder="My Moon 🌙 · Panda 🐼 · Handsome…"
          className="w-full rounded-xl border border-princess-pink/25 bg-white/70 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
        />
        <div className="mt-1 text-right text-[10px] text-slate-400">
          {value.length}/{NICKNAME_MAX}
        </div>
      </div>

      <button
        onClick={() => canSave && onSave(value)}
        disabled={!canSave}
        className="heart-btn mt-2 w-full rounded-2xl py-3.5 text-base font-semibold text-white transition disabled:opacity-50"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
