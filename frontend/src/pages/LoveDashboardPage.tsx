import { useState } from 'react';
import { LoveLayout } from '@/layouts/LoveLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLoveStore } from '@/store/loveStore';
import { usePartnerNickname } from '@/hooks/useCouple';
import { useNow } from '@/hooks/useNow';
import {
  countdownTo,
  daysSince,
  daysUntilRecurring,
  prettyDate,
  type LoveConfig,
} from '@/lib/love';

function BigCounter({ days, nickname }: { days: number | null; nickname: string }) {
  return (
    <div className="glass-card relative overflow-hidden p-6 text-center">
      <div className="pointer-events-none absolute -right-6 -top-6 text-8xl opacity-10">💞</div>
      <p className="my-1 text-6xl font-extrabold love-text tabular-nums">{days ?? '—'}</p>
      <p className="text-sm text-slate-500 dark:text-slate-300">
        days with <b key={nickname} className="animate-pop-in love-text">{nickname}</b> · forever to go 💗
      </p>
    </div>
  );
}

function Milestone({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="glass-card flex items-center gap-3 p-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl love-gradient text-xl shadow-glow">
        {emoji}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function CountdownCard({ label, cd }: { label: string; cd: ReturnType<typeof countdownTo> }) {
  const parts = cd
    ? [
        { v: cd.days, l: 'days' },
        { v: cd.hours, l: 'hrs' },
        { v: cd.mins, l: 'min' },
        { v: cd.secs, l: 'sec' },
      ]
    : null;
  return (
    <div className="glass-card p-5 text-center">
      <p className="mb-3 text-sm font-medium text-princess-purple">{label}</p>
      {parts ? (
        <div className="flex justify-center gap-2">
          {parts.map((p) => (
            <div key={p.l} className="love-gradient min-w-[58px] rounded-2xl px-2 py-2 text-white shadow-glow">
              <div className="text-2xl font-bold tabular-nums">{String(p.v).padStart(2, '0')}</div>
              <div className="text-[10px] uppercase opacity-90">{p.l}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Set a date to start the countdown 💫</p>
      )}
    </div>
  );
}

export default function LoveDashboardPage() {
  const now = useNow(1000);
  const { config, setConfig } = useLoveStore();
  const nickname = usePartnerNickname();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LoveConfig>(config);

  const openEdit = () => {
    setDraft(config);
    setEditing(true);
  };
  const save = () => {
    setConfig(draft);
    setEditing(false);
  };

  const field = (label: string, key: keyof LoveConfig, type: 'date' | 'datetime-local' | 'text' = 'date') => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-300">{label}</span>
      <input
        type={type}
        value={draft[key]}
        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
        className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
      />
    </label>
  );

  return (
    <LoveLayout title={`Us 💕`} subtitle={`You & ${nickname}`}>
      <div className="space-y-4">
        <BigCounter days={daysSince(config.firstMeet, now)} nickname={nickname} />

        <div className="grid grid-cols-2 gap-3">
          <CountdownCard label="Next time we meet 🥹" cd={countdownTo(config.nextMeeting, now)} />
          <div className="glass-card p-5 text-center">
            <p className="mb-2 text-sm font-medium text-princess-purple">Coming up soon 🎉</p>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-200">
              <p>
                💍 Anniversary in{' '}
                <b className="love-text">{daysUntilRecurring(config.anniversary, now) ?? '—'}</b> days
              </p>
              <p>
                🎂 Her birthday in{' '}
                <b className="love-text">{daysUntilRecurring(config.princessBirthday, now) ?? '—'}</b> days
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Milestone emoji="👀" label="First time we met" value={prettyDate(config.firstMeet)} />
          <Milestone emoji="🤗" label="Our first hug" value={prettyDate(config.firstHug)} />
          <Milestone emoji="🎁" label="First gift" value={prettyDate(config.firstGift)} />
          <Milestone emoji="💍" label="Anniversary" value={prettyDate(config.anniversary)} />
        </div>

        <button
          onClick={openEdit}
          className="heart-btn w-full rounded-2xl py-3 text-sm font-semibold text-white transition"
        >
          ✎ Edit our special dates
        </button>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Our special dates 💗" className="max-w-lg">
        <div className="scrollbar-thin grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {field('Your name', 'yourName', 'text')}
          {field('Her name', 'princessName', 'text')}
          {field('First met', 'firstMeet')}
          {field('First hug', 'firstHug')}
          {field('First gift', 'firstGift')}
          {field('Anniversary', 'anniversary')}
          {field('Her birthday', 'princessBirthday')}
          {field('Next meeting', 'nextMeeting', 'datetime-local')}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={save}>Save 💖</Button>
        </div>
      </Modal>
    </LoveLayout>
  );
}
