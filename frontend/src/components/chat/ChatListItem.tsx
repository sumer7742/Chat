import { memo } from 'react';
import type { Chat, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { chatDisplay, unreadFor } from '@/lib/chat';
import { formatChatTimestamp, cn } from '@/lib/utils';
import { usePresenceStore } from '@/store/presenceStore';
import { PinIcon } from '@/components/ui/icons';

function lastMessagePreview(chat: Chat): string {
  const m = chat.lastMessage;
  if (!m) return 'No messages yet';
  if (m.isDeleted) return '🚫 This message was deleted';
  if (m.type === 'text') return m.text ?? '';
  const map: Record<string, string> = {
    image: '📷 Photo',
    video: '🎥 Video',
    voice: '🎙️ Voice message',
    audio: '🎵 Audio',
    document: '📄 Document',
    location: '📍 Location',
    contact: '👤 Contact',
    poll: '📊 Poll',
    code: '💻 Code snippet',
  };
  return map[m.type] ?? m.text ?? 'Attachment';
}

export const ChatListItem = memo(function ChatListItem({
  chat,
  me,
  active,
  onClick,
}: {
  chat: Chat;
  me: User | null;
  active: boolean;
  onClick: () => void;
}) {
  const display = chatDisplay(chat, me);
  const unread = unreadFor(chat, me);
  const pinned = chat.members.find((m) => m.user._id === me?._id)?.pinned;
  const online = usePresenceStore((s) => (display.otherUser ? s.online[display.otherUser._id] : undefined));

  return (
    <button
      onClick={onClick}
      className={cn(
        'mx-2 my-0.5 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-princess-pink/10',
        active && 'bg-white/60 shadow-glow ring-1 ring-princess-pink/30 backdrop-blur-md dark:bg-white/10',
      )}
      style={{ width: 'calc(100% - 1rem)' }}
    >
      <span className={cn('rounded-full p-0.5', active ? 'love-gradient' : 'bg-transparent')}>
        <Avatar
          name={display.name}
          src={display.avatarUrl}
          id={display.id}
          size={46}
          online={display.isGroup ? undefined : online}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 truncate font-medium text-slate-800 dark:text-slate-100">
            {pinned && <PinIcon className="h-3 w-3 text-slate-400" />}
            {display.name}
          </span>
          <span className={cn('shrink-0 text-xs', unread ? 'text-accent-500 dark:text-accent-400' : 'text-slate-400')}>
            {formatChatTimestamp(chat.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-slate-500 dark:text-slate-400">{lastMessagePreview(chat)}</span>
          {unread > 0 && (
            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-primary px-1.5 text-xs font-semibold text-white shadow-glow">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});
