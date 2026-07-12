import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border bg-white/70 px-3 py-2.5 text-sm text-slate-900 outline-none backdrop-blur-md transition placeholder:text-slate-400 focus:border-princess-pink focus:ring-2 focus:ring-princess-pink/30 dark:bg-white/10 dark:text-slate-100',
            icon && 'pl-10',
            error ? 'border-red-400' : 'border-princess-pink/20 dark:border-white/10',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
