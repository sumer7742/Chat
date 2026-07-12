import { Modal } from '@/components/ui/Modal';
import { useUIStore } from '@/store/uiStore';
import { THEMES, CHAT_BGS, themeGradientCss } from '@/lib/themes';
import { cn } from '@/lib/utils';

export function ThemePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const themeId = useUIStore((s) => s.themeId);
  const setThemeId = useUIStore((s) => s.setThemeId);
  const chatBgId = useUIStore((s) => s.chatBgId);
  const setChatBgId = useUIStore((s) => s.setChatBgId);
  const mode = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  return (
    <Modal open={open} onClose={onClose} title="Choose a theme">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {THEMES.map((t) => {
          const active = t.id === themeId;
          return (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition',
                active
                  ? 'border-transparent shadow-glow ring-2 ring-accent-500'
                  : 'border-slate-200 hover:border-accent-500/50 dark:border-surface-hover',
              )}
            >
              <span
                className="h-12 w-12 rounded-full shadow-md ring-1 ring-black/5"
                style={{ backgroundImage: themeGradientCss(t) }}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{t.name}</span>
              {active && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">Chat background</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CHAT_BGS.map((bg) => {
            const active = bg.id === chatBgId;
            return (
              <button
                key={bg.id}
                onClick={() => setChatBgId(bg.id)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-xl border p-2 transition',
                  active
                    ? 'border-transparent shadow-glow ring-2 ring-accent-500'
                    : 'border-slate-200 hover:border-accent-500/50 dark:border-surface-hover',
                )}
              >
                <span
                  className="h-10 w-full rounded-lg shadow-sm ring-1 ring-black/5"
                  style={{ background: bg.preview }}
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{bg.name}</span>
                {active && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] text-white">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3 dark:bg-surface-hover">
        <span className="text-sm text-slate-600 dark:text-slate-300">Appearance</span>
        <button
          onClick={toggleTheme}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium capitalize text-slate-700 shadow-sm dark:bg-surface-panel dark:text-slate-100"
        >
          {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </Modal>
  );
}
