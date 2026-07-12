import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LoveLayout } from '@/layouts/LoveLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLoveStore } from '@/store/loveStore';
import { useNow } from '@/hooks/useNow';
import { EVENT_TYPES, daysUntilEvent, prettyDate, type CoupleEvent } from '@/lib/love';

function countdownLabel(days: number | null): { text: string; soon: boolean } {
  if (days === null) return { text: '', soon: false };
  if (days === 0) return { text: 'Today! 🎉', soon: true };
  if (days < 0) return { text: `${Math.abs(days)}d ago`, soon: false };
  return { text: `in ${days} day${days === 1 ? '' : 's'}`, soon: days <= 7 };
}

export default function CoupleCalendarPage() {
  const now = useNow(60_000);
  const { events, addEvent, removeEvent } = useLoveStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<CoupleEvent['type']>('date');
  const [recurring, setRecurring] = useState(true);

  const sorted = useMemo(() => {
    return [...events]
      .map((e) => ({ e, days: daysUntilEvent(e, now) }))
      .sort((a, b) => {
        const av = a.days ?? 99999;
        const bv = b.days ?? 99999;
        const ap = av < 0 ? 99998 : av;
        const bp = bv < 0 ? 99998 : bv;
        return ap - bp;
      });
  }, [events, now]);

  const add = () => {
    if (!title.trim() || !date) return toast.error('Add a title and date 📅');
    addEvent({ title: title.trim(), date, type, recurring });
    setTitle('');
    setDate('');
    setType('date');
    setRecurring(true);
    setAdding(false);
    toast.success('Event added 💖');
  };

  return (
    <LoveLayout title="Couple Calendar 📅" subtitle="Never miss a moment that matters">
      {sorted.length === 0 ? (
        <div className="glass-card mt-4 p-10 text-center">
          <div className="mb-3 text-5xl">📅</div>
          <p className="text-slate-500 dark:text-slate-300">No events yet. Add your anniversary, her birthday, your next date…</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map(({ e, days }) => {
            const meta = EVENT_TYPES.find((t) => t.id === e.type)!;
            const cd = countdownLabel(days);
            return (
              <div key={e.id} className="glass-card group flex items-center gap-3 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl love-gradient text-2xl shadow-glow">
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-700 dark:text-slate-100">{e.title}</p>
                  <p className="text-xs text-slate-400">
                    {prettyDate(e.date)} {e.recurring && '· yearly'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    cd.soon ? 'love-gradient text-white shadow-glow' : 'bg-princess-purple/10 text-princess-purple'
                  }`}
                >
                  {cd.text}
                </span>
                <button
                  onClick={() => removeEvent(e.id)}
                  className="text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setAdding(true)}
        className="heart-btn animate-heartbeat fixed bottom-24 right-6 z-30 grid h-14 w-14 place-items-center rounded-full text-2xl text-white"
        aria-label="Add event"
      >
        ＋
      </button>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a special day 📅" className="max-w-lg">
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are we celebrating?"
            className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  type === t.id ? 'love-gradient text-white shadow-glow' : 'glass-card text-slate-500'
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="accent-princess-pink" />
            🔁 Repeats every year
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          <Button onClick={add}>Add 💖</Button>
        </div>
      </Modal>
    </LoveLayout>
  );
}
