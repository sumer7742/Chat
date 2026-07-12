import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Chat, Message, User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { messageService } from '@/services/message.service';
import { queryKeys } from '@/lib/queryClient';
import { chatDisplay } from '@/lib/chat';
import { assetUrl, formatMessageTime } from '@/lib/utils';

interface MediaItem {
  key: string;
  url: string;
  isVideo: boolean;
  mine: boolean;
  createdAt: string;
}

/** Flattens image/video attachments out of messages into gallery items. */
function toItems(messages: Message[], meId: string | undefined): MediaItem[] {
  const items: MediaItem[] = [];
  for (const m of messages) {
    m.attachments.forEach((att, i) => {
      const isImage = att.mimeType.startsWith('image/');
      const isVideo = att.mimeType.startsWith('video/');
      if (!isImage && !isVideo) return;
      const url = assetUrl(att.url);
      if (!url) return;
      items.push({
        key: `${m._id}-${i}`,
        url,
        isVideo,
        mine: m.sender._id === meId,
        createdAt: m.createdAt,
      });
    });
  }
  return items;
}

function Thumb({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group relative aspect-square overflow-hidden rounded-lg bg-black/5 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10"
    >
      {item.isVideo ? (
        <>
          <video src={item.url} className="h-full w-full object-cover" muted preload="metadata" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-2xl text-white">▶</span>
        </>
      ) : (
        <img
          src={item.url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      )}
    </button>
  );
}

function Section({ title, items, onOpen }: { title: string; items: MediaItem[]; onOpen: (i: MediaItem) => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-slate-500 dark:bg-surface-hover dark:text-slate-400">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">Nothing shared yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {items.map((item) => (
            <Thumb key={item.key} item={item} onOpen={() => onOpen(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MediaGallery({
  open,
  onClose,
  chat,
  me,
}: {
  open: boolean;
  onClose: () => void;
  chat: Chat;
  me: User | null;
}) {
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const display = chatDisplay(chat, me);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.media(chat._id),
    queryFn: () => messageService.listMedia(chat._id),
    enabled: open,
  });

  const { mine, theirs } = useMemo(() => {
    const items = toItems(data ?? [], me?._id);
    return {
      mine: items.filter((i) => i.mine),
      theirs: items.filter((i) => !i.mine),
    };
  }, [data, me?._id]);

  const theirLabel = display.isGroup ? 'From others' : `From ${display.name}`;

  return (
    <>
      <Modal open={open} onClose={onClose} title="Shared media" className="max-w-2xl">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size={26} />
          </div>
        ) : mine.length === 0 && theirs.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">No photos or videos shared yet.</p>
        ) : (
          <div className="scrollbar-thin max-h-[65vh] space-y-6 overflow-y-auto pr-1">
            <Section title="Sent by you" items={mine} onOpen={setPreview} />
            <Section title={theirLabel} items={theirs} onOpen={setPreview} />
          </div>
        )}
      </Modal>

      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 max-h-[90vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {preview.isVideo ? (
              <video src={preview.url} controls autoPlay className="max-h-[85vh] rounded-xl" />
            ) : (
              <img src={preview.url} alt="" className="max-h-[85vh] rounded-xl" />
            )}
            <div className="mt-2 flex items-center justify-between text-xs text-white/80">
              <span>{preview.mine ? 'You' : display.name} · {formatMessageTime(preview.createdAt)}</span>
              <div className="flex gap-3">
                <a href={preview.url} target="_blank" rel="noreferrer" className="hover:text-white">Open ↗</a>
                <button onClick={() => setPreview(null)} className="hover:text-white">Close ✕</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
