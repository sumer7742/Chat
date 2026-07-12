import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { LoveLayout } from '@/layouts/LoveLayout';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLoveStore } from '@/store/loveStore';
import { usePartnerNickname } from '@/hooks/useCouple';
import { prettyDate, type Memory } from '@/lib/love';

export default function MemoriesPage() {
  const { memories, addMemory, updateMemory, removeMemory } = useLoveStore();
  const nickname = usePartnerNickname();
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<Memory | null>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('');

  const shown = useMemo(
    () => (onlyFavs ? memories.filter((m) => m.favorite) : memories),
    [memories, onlyFavs],
  );

  // Read a picked file as a data URL so it persists in localStorage.
  const onFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_500_000) return toast.error('Please pick an image under ~2.5 MB 🙏');
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!imageUrl.trim()) return toast.error('Add a photo (upload or paste a link) 📷');
    addMemory({ imageUrl: imageUrl.trim(), caption: caption.trim(), date: date || new Date().toISOString().slice(0, 10) });
    setImageUrl('');
    setCaption('');
    setDate('');
    setAdding(false);
    toast.success('Memory saved 💞');
  };

  return (
    <LoveLayout title="Our Memories 📸" subtitle={`Every moment with ${nickname}`}>
      <div className="mb-4 flex items-center justify-center gap-2 text-xs">
        <button
          onClick={() => setOnlyFavs(false)}
          className={`rounded-full px-4 py-1.5 font-medium transition ${!onlyFavs ? 'love-gradient text-white shadow-glow' : 'glass-card text-slate-500'}`}
        >
          All moments
        </button>
        <button
          onClick={() => setOnlyFavs(true)}
          className={`rounded-full px-4 py-1.5 font-medium transition ${onlyFavs ? 'love-gradient text-white shadow-glow' : 'glass-card text-slate-500'}`}
        >
          ⭐ Favorites
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="glass-card mt-4 p-10 text-center">
          <div className="mb-3 text-5xl">🌸</div>
          <p className="text-slate-500 dark:text-slate-300">
            {onlyFavs ? 'No favorites yet — star the ones you love.' : 'Start your timeline. Add your first memory together.'}
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
          {shown.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewing(m)}
              className="glass-card group relative block w-full overflow-hidden p-1.5 text-left"
            >
              <img src={m.imageUrl} alt={m.caption} className="w-full rounded-2xl object-cover" loading="lazy" />
              {m.favorite && <span className="absolute right-3 top-3 text-amber-400 drop-shadow">⭐</span>}
              {m.caption && (
                <p className="truncate px-1.5 pb-1 pt-1.5 text-xs font-medium text-slate-600 dark:text-slate-200">
                  {m.caption}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setAdding(true)}
        className="heart-btn animate-heartbeat fixed bottom-24 right-6 z-30 grid h-14 w-14 place-items-center rounded-full text-2xl text-white"
        aria-label="Add memory"
      >
        ＋
      </button>

      {/* Add memory */}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add a memory 📸" className="max-w-lg">
        <div className="space-y-3">
          {imageUrl && <img src={imageUrl} alt="" className="max-h-52 w-full rounded-2xl object-cover" />}
          <div className="flex gap-2">
            <label className="glass-card flex-1 cursor-pointer rounded-xl px-3 py-2 text-center text-sm text-princess-purple">
              📁 Upload photo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </div>
          <input
            value={imageUrl.startsWith('data:') ? '' : imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="…or paste an image link"
            className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (e.g. Our first date 🥰)"
            className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-princess-purple/20 bg-white/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-princess-pink/40 dark:bg-white/10 dark:text-slate-100"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          <Button onClick={submit}>Save memory 💖</Button>
        </div>
      </Modal>

      {/* Viewer */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 max-h-[90vh] max-w-lg" onClick={(e) => e.stopPropagation()}>
            <img src={viewing.imageUrl} alt={viewing.caption} className="max-h-[75vh] w-full rounded-3xl object-contain" />
            <div className="glass-card mt-3 flex items-center justify-between p-3">
              <div className="min-w-0">
                <p className="truncate font-script text-xl text-princess-pink">{viewing.caption || 'A sweet moment'}</p>
                <p className="text-xs text-slate-400">{prettyDate(viewing.date)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    updateMemory(viewing.id, { favorite: !viewing.favorite });
                    setViewing({ ...viewing, favorite: !viewing.favorite });
                  }}
                  className="text-xl"
                  title="Favorite"
                >
                  {viewing.favorite ? '⭐' : '☆'}
                </button>
                <button
                  onClick={() => {
                    removeMemory(viewing.id);
                    setViewing(null);
                  }}
                  className="text-lg text-red-400"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoveLayout>
  );
}
