import type { ReactNode } from 'react';
import { FloatingHearts } from '@/components/love/FloatingHearts';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden love-bg p-4">
      <FloatingHearts count={14} />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-[1.4rem] love-gradient animate-shimmer text-3xl shadow-glow">
            <span className="animate-heartbeat">💖</span>
          </div>
          <h1 className="font-script text-4xl love-text">Only for My Princess</h1>
          <p className="text-sm text-princess-purple dark:text-princess-rose">A private world for two hearts</p>
        </div>
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-300">{subtitle}</p>}
          <div className={subtitle ? '' : 'mt-6'}>{children}</div>
        </div>
      </div>
    </div>
  );
}
