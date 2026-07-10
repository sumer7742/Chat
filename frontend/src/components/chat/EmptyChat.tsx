export function EmptyChat() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-surface-muted text-center dark:bg-surface-dark">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/10 text-5xl">
        💬
      </div>
      <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Pulse for Web</h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Select a conversation or start a new one to begin messaging. Your chats sync in real time
        across all your devices.
      </p>
    </div>
  );
}
