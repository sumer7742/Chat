import { useState } from 'react';
import type { Chat, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { chatDisplay } from '@/lib/chat';
import { formatLastSeen } from '@/lib/utils';
import { usePresenceStore } from '@/store/presenceStore';
import { BackIcon, PhoneIcon, VideoIcon, SearchIcon } from '@/components/ui/icons';
import { ChatInfoModal } from './ChatInfoModal';
import { startCall } from '@/lib/call';

export function ChatHeader({ chat, me, onBack }: { chat: Chat; me: User | null; onBack: () => void }) {
  const display = chatDisplay(chat, me);
  const [showInfo, setShowInfo] = useState(false);
  const online = usePresenceStore((s) => (display.otherUser ? s.online[display.otherUser._id] : undefined));
  const typing = usePresenceStore((s) => s.typing[chat._id] ?? {});
  const typingNames = Object.values(typing);

  const subtitle = display.isGroup
    ? `${chat.members.length} members`
    : typingNames.length
    ? 'typing…'
    : online
    ? 'online'
    : formatLastSeen(display.otherUser?.lastSeen);

  const callTargets = chat.members.filter((m) => m.user._id !== me?._id).map((m) => m.user._id);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-surface-hover dark:bg-surface-panel">
        <button onClick={onBack} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-surface-hover">
          <BackIcon />
        </button>
        <button onClick={() => setShowInfo(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <Avatar name={display.name} src={display.avatarUrl} id={display.id} size={40} online={display.isGroup ? undefined : online} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{display.name}</p>
            <p className="truncate text-xs text-brand-600 dark:text-brand-400">{subtitle}</p>
          </div>
        </button>
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-300">
          <button onClick={() => startCall(chat._id, callTargets, 'voice')} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-surface-hover" title="Voice call">
            <PhoneIcon />
          </button>
          <button onClick={() => startCall(chat._id, callTargets, 'video')} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-surface-hover" title="Video call">
            <VideoIcon />
          </button>
          <button onClick={() => setShowInfo(true)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-surface-hover" title="Search / info">
            <SearchIcon />
          </button>
        </div>
      </header>
      <ChatInfoModal open={showInfo} onClose={() => setShowInfo(false)} chat={chat} me={me} />
    </>
  );
}
