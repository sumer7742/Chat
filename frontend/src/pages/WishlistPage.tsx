import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LoveLayout } from '@/layouts/LoveLayout';
import { useLoveStore } from '@/store/loveStore';
import { WISH_CATEGORIES, type WishCategory } from '@/lib/love';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const { wishlist, addWish, toggleWish, removeWish } = useLoveStore();
  const [cat, setCat] = useState<WishCategory>('destinations');
  const [title, setTitle] = useState('');

  const items = useMemo(() => wishlist.filter((w) => w.category === cat), [wishlist, cat]);
  const active = WISH_CATEGORIES.find((c) => c.id === cat)!;

  const add = () => {
    if (!title.trim()) return toast.error('Add a little dream ✨');
    addWish({ category: cat, title: title.trim() });
    setTitle('');
  };

  return (
    <LoveLayout title="Our Wishlist ⭐" subtitle="Dreams we'll chase together">
      {/* Category chips */}
      <div className="scrollbar-thin mb-4 flex gap-2 overflow-x-auto pb-1">
        {WISH_CATEGORIES.map((c) => {
          const count = wishlist.filter((w) => w.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition',
                cat === c.id ? 'love-gradient text-white shadow-glow' : 'glass-card text-slate-500 dark:text-slate-300',
              )}
            >
              <span>{c.emoji}</span> {c.label}
              {count > 0 && <span className="rounded-full bg-white/30 px-1.5 text-[10px]">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Add row */}
      <div className="glass-card mb-4 flex items-center gap-2 p-2">
        <span className="pl-2 text-xl">{active.emoji}</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder={`Add to ${active.label.toLowerCase()}…`}
          className="flex-1 bg-transparent px-1 py-2 text-sm outline-none dark:text-slate-100"
        />
        <button onClick={add} className="heart-btn rounded-full px-4 py-2 text-sm font-semibold text-white">
          Add 💗
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <div className="mb-2 text-5xl">{active.emoji}</div>
          <p className="text-slate-500 dark:text-slate-300">No {active.label.toLowerCase()} yet. Start dreaming together 💫</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((w) => (
            <div key={w.id} className="glass-card group flex items-center gap-3 p-3.5">
              <button
                onClick={() => toggleWish(w.id)}
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-sm transition',
                  w.done ? 'love-gradient border-transparent text-white' : 'border-princess-purple/40 text-transparent',
                )}
              >
                ✓
              </button>
              <span
                className={cn(
                  'flex-1 text-sm text-slate-700 dark:text-slate-100',
                  w.done && 'text-slate-400 line-through dark:text-slate-500',
                )}
              >
                {w.title}
              </span>
              <button
                onClick={() => removeWish(w.id)}
                className="text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </LoveLayout>
  );
}
