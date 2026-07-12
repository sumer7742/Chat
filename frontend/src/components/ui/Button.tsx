import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-primary text-white shadow-glow hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60',
  secondary:
    'glass text-slate-700 hover:bg-white/90 dark:text-slate-100 dark:hover:bg-white/10',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-surface-hover',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner size={16} className="text-current" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
