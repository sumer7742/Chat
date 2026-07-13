import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FloatingHearts } from '@/components/love/FloatingHearts';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/love', label: 'Home', icon: '💞', end: true },
  { to: '/love/memories', label: 'Memories', icon: '📸', end: false },
  { to: '/', label: 'Chat', icon: '💬', end: false },
  { to: '/love/letters', label: 'Letters', icon: '💌', end: false },
  { to: '/love/calendar', label: 'Calendar', icon: '📅', end: false },
];

export function LoveLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full flex-col overflow-hidden love-bg font-sans">
      <FloatingHearts />

      {/* Header / hero greeting */}
      <header className="relative z-10 flex items-center gap-3 px-5 pb-4 pt-6">
        <button
          onClick={() => navigate('/')}
          className="glass-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
          aria-label="Back to chat"
        >
          ←
        </button>
        <div className="min-w-0 animate-fade-in">
          <h1 className="truncate text-[26px] font-extrabold leading-tight tracking-tight love-text">{title}</h1>
          {subtitle && (
            <p className="truncate text-[13px] font-light text-slate-400 dark:text-princess-rose/70">{subtitle}</p>
          )}
        </div>
      </header>

      {/* Scrollable content */}
      <main className="scrollbar-thin relative z-10 flex-1 overflow-y-auto px-4 pb-28 pt-2">
        <div className="mx-auto w-full max-w-2xl animate-fade-in">{children}</div>
      </main>

      {/* Elegant glass bottom navigation */}
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-4">
        <div className="glass-card pointer-events-auto flex items-center gap-1 rounded-full px-2 py-1.5 shadow-lg">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center rounded-full px-3.5 py-1.5 text-[10px] font-medium transition',
                  isActive
                    ? 'love-gradient animate-shimmer text-white shadow-glow'
                    : 'text-slate-500 hover:bg-white/50 dark:text-slate-300 dark:hover:bg-white/10',
                )
              }
            >
              <span className="text-lg leading-none">{n.icon}</span>
              <span className="mt-0.5">{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
