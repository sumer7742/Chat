import { usePresenceStore } from '@/store/presenceStore';

export function TypingIndicator({ chatId }: { chatId: string }) {
  const typing = usePresenceStore((s) => s.typing[chatId] ?? {});
  const activity = usePresenceStore((s) => s.activity[chatId] ?? {});
  const names = Object.values(typing);
  const recording = Object.values(activity).includes('recording');

  if (names.length === 0 && !recording) return null;

  const label = recording
    ? 'recording audio…'
    : names.length === 1
    ? `${names[0]} is typing`
    : `${names.length} people are typing`;

  return (
    <div className="mb-1 mt-2 flex items-center gap-2 px-1">
      <div className="flex gap-1 rounded-full bg-white px-3 py-2 shadow-sm dark:bg-surface-panel">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
