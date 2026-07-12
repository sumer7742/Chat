import { useState } from 'react';
import type { Chat, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { chatDisplay } from '@/lib/chat';
import { formatLastSeen, cn } from '@/lib/utils';
import { usePresenceStore } from '@/store/presenceStore';
import { useCouple, usePartnerNickname } from '@/hooks/useCouple';
import { PhoneIcon, VideoIcon, SearchIcon } from '@/components/ui/icons';
import { ChatInfoModal } from './ChatInfoModal';
import { startCall } from '@/lib/call';

export function ChatHeader({ chat, me, onBack }: { chat: Chat; me: User | null; onBack: () => void }) {
  const display = chatDisplay(chat, me);
  const { data: couple } = useCouple();
  const nickname = usePartnerNickname();
  const [showInfo, setShowInfo] = useState(false);
  const online = usePresenceStore((s) => (display.otherUser ? s.online[display.otherUser._id] : undefined));
  const typing = usePresenceStore((s) => s.typing[chat._id] ?? {});
  const typingNames = Object.values(typing);

  // In the couple's private chat, show the nickname the current user chose.
  const isPartnerChat = !display.isGroup && couple?.chatId === chat._id;
  const title = isPartnerChat ? nickname : display.name;

  const subtitle = display.isGroup
    ? `${chat.members.length} members`
    : typingNames.length
    ? isPartnerChat
      ? `${nickname} is typing…`
      : 'typing…'
    : online
    ? 'online'
    : formatLastSeen(display.otherUser?.lastSeen);

  const callTargets = chat.members.filter((m) => m.user._id !== me?._id).map((m) => m.user._id);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-princess-pink/15 bg-white/55 px-4 py-2.5 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
        <button
          onClick={onBack}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full love-gradient text-white shadow-glow transition active:scale-90"
          title="Our Love space"
        >
          <span className="text-base leading-none">💞</span>
        </button>
        <button onClick={() => setShowInfo(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="rounded-full love-gradient p-0.5 shadow-glow">
            <Avatar name={display.name} src={display.avatarUrl} id={display.id} size={38} online={display.isGroup ? undefined : online} />
          </span>
          <div className="min-w-0">
            <p key={title} className="animate-pop-in truncate font-semibold text-slate-800 dark:text-slate-100">{title}</p>
            <p className={cn('truncate text-xs', subtitle === 'online' || subtitle === 'typing…' ? 'text-emerald-500' : 'text-princess-purple dark:text-princess-rose')}>
              {subtitle === 'online' && '● '}{subtitle}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 text-princess-purple dark:text-princess-rose">
          <button onClick={() => startCall(chat._id, callTargets, 'voice')} className="rounded-full p-2 hover:bg-princess-pink/10" title="Voice call">
            <PhoneIcon />
          </button>
          <button onClick={() => startCall(chat._id, callTargets, 'video')} className="rounded-full p-2 hover:bg-princess-pink/10" title="Video call">
            <VideoIcon />
          </button>
          <button onClick={() => setShowInfo(true)} className="rounded-full p-2 hover:bg-princess-pink/10" title="Search / info">
            <SearchIcon />
          </button>
        </div>
      </header>
      <ChatInfoModal open={showInfo} onClose={() => setShowInfo(false)} chat={chat} me={me} />
    </>
  );
}
