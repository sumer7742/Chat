import { useState } from 'react';
import toast from 'react-hot-toast';
import { LoveLayout } from '@/layouts/LoveLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLoveStore } from '@/store/loveStore';
import { useNow } from '@/hooks/useNow';
import { prettyDate, type LoveLetter } from '@/lib/love';
import { cn } from '@/lib/utils';

function isSealed(letter: LoveLetter, now: Date): boolean {
  if (letter.unlockAt) return new Date(letter.unlockAt).getTime() > now.getTime();
  return letter.locked;
}

export default function LoveLettersPage() {
  const now = useNow(1000);
  const { letters, addLetter, updateLetter, removeLetter } = useLoveStore();
  const [composing, setComposing] = useState(false);
  const [reading, setReading] = useState<LoveLetter | null>(null);
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [locked, setLocked] = useState(false);

  const submit = () => {
    if (!body.trim()) return toast.error('Write a little something 💌');
    addLetter({ title: title.trim() || 'A letter for you', body: body.trim(), unlockAt: unlockAt || undefined, locked });
    setTitle('');
    setBody('');
    setUnlockAt('');
    setLocked(false);
    setComposing(false);
    toast.success('Letter saved 💖');
  };

  const openLetter = (l: LoveLetter) => {
    if (isSealed(l, now) && !unlocked[l.id]) {
      if (l.unlockAt && new Date(l.unlockAt).getTime() > now.getTime()) {
        return toast(`Sealed until ${prettyDate(l.unlockAt)} 🔒`, { icon: '⏳' });
      }
      // Locked private note — reveal on tap (this is a private on-device app).
      setUnlocked((u) => ({ ...u, [l.id]: true }));
    }
    setReading(l);
  };

  return (
    <LoveLayout title="Love Letters 💌" subtitle="Words from my heart to yours">
      {letters.length === 0 ? (
        <div className="glass-card mt-6 p-10 text-center">
          <div className="mb-3 text-5xl">💌</div>
          <p className="text-slate-500 dark:text-slate-300">No letters yet. Write the first one for her.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {letters.map((l) => {
            const sealed = isSealed(l, now) && !unlocked[l.id];
            return (
              <button
                key={l.id}
                onClick={() => openLetter(l)}
                className="glass-card group relative p-5 text-left transition hover:-translate-y-0.5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{sealed ? '🔒' : '💗'}</span>
                  <span className="text-[11px] text-slate-400">{prettyDate(l.createdAt.slice(0, 10))}</span>
                </div>
                <h3 className="font-script text-2xl text-princess-pink">{l.title}</h3>
                <p className={cn('mt-1 text-sm text-slate-600 dark:text-slate-300', sealed && 'blur-sm select-none')}>
                  {sealed ? 'This letter is sealed with love…' : l.body.slice(0, 80) + (l.body.length > 80 ? '…' : '')}
                </p>
                {l.unlockAt && new Date(l.unlockAt).getTime() > now.getTime() && (
                  <p className="mt-2 text-[11px] font-medium text-princess-purple">⏳ Opens {prettyDate(l.unlockAt)}</p>
                )}
                {l.favorite && <span className="absolute right-3 top-3 text-amber-400">⭐</span>}
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setComposing(true)}
        className="heart-btn animate-heartbeat fixed bottom-24 right-6 z-30 grid h-14 w-14 place-items-center rounded-full text-2xl text-white"
        aria-label="Write a letter"
      >
        ✍️
      </button>

      {/* Composer */}
      <Modal open={composing} onClose={() => setComposing(false)} title="Write a love letter ✍️" className="max-w-lg">
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g. To my forever)"
            className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            placeholder="My dearest…"
            className="w-full resize-none rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 font-script text-lg leading-relaxed outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-300">
              Schedule / future letter (optional)
            </span>
            <input
              type="datetime-local"
              value={unlockAt}
              onChange={(e) => setUnlockAt(e.target.value)}
              className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} className="accent-princess-pink" />
            🔒 Keep this a locked private note
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setComposing(false)}>Cancel</Button>
          <Button onClick={submit}>Seal with love 💖</Button>
        </div>
      </Modal>

      {/* Reader */}
      <Modal open={!!reading} onClose={() => setReading(null)} title={reading?.title} className="max-w-lg">
        {reading && (
          <>
            <p className="whitespace-pre-wrap font-script text-2xl leading-relaxed text-slate-700 dark:text-slate-100">
              {reading.body}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    updateLetter(reading.id, { favorite: !reading.favorite });
                    setReading({ ...reading, favorite: !reading.favorite });
                  }}
                >
                  {reading.favorite ? '⭐ Favorited' : '☆ Favorite'}
                </Button>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  removeLetter(reading.id);
                  setReading(null);
                }}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </Modal>
    </LoveLayout>
  );
}
