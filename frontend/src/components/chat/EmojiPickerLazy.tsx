import { lazy, Suspense } from 'react';
import { Spinner } from '@/components/ui/Spinner';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

export function EmojiPickerLazy({
  theme,
  onPick,
}: {
  theme: 'light' | 'dark';
  onPick: (emoji: string) => void;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-[380px] w-[320px] items-center justify-center rounded-lg bg-white shadow-lg dark:bg-surface-panel">
          <Spinner />
        </div>
      }
    >
      <EmojiPicker
        theme={theme === 'dark' ? ('dark' as never) : ('light' as never)}
        onEmojiClick={(e) => onPick(e.emoji)}
        width={320}
        height={380}
        lazyLoadEmojis
      />
    </Suspense>
  );
}
