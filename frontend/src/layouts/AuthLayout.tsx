import type { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-700 via-brand-900 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-2xl shadow-lg">
            💬
          </div>
          <h1 className="text-2xl font-bold text-white">Pulse</h1>
          <p className="text-sm text-brand-100/80">Realtime messaging</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-surface-panel">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          <div className={subtitle ? '' : 'mt-6'}>{children}</div>
        </div>
      </div>
    </div>
  );
}
