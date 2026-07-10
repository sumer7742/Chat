import { assetUrl, colorForId, initials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  id?: string;
  size?: number;
  online?: boolean;
  className?: string;
}

export function Avatar({ name, src, id = name, size = 40, online, className }: AvatarProps) {
  const url = assetUrl(src);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <img
          src={url}
          alt={name}
          className={cn('h-full w-full rounded-full object-cover', className)}
          loading="lazy"
        />
      ) : (
        <div
          className={cn('flex h-full w-full items-center justify-center rounded-full font-semibold text-white', className)}
          style={{ backgroundColor: colorForId(id), fontSize: size * 0.4 }}
        >
          {initials(name) || '?'}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-surface-dark',
            online ? 'bg-brand-500' : 'bg-slate-400',
          )}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
