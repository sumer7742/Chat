import { FloatingHearts } from '@/components/love/FloatingHearts';

export function EmptyChat() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden love-bg text-center">
      <FloatingHearts count={12} />
      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="mb-5 grid h-24 w-24 place-items-center rounded-[2rem] love-gradient animate-shimmer text-5xl shadow-glow">
          <span className="animate-heartbeat">💖</span>
        </div>
        <h2 className="font-script text-4xl love-text">Only for My Princess</h2>
        <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-300">
          Pick a conversation and say something sweet — every message here is written with love. 💌
        </p>
      </div>
    </div>
  );
}
