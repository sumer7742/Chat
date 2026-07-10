import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { EmptyChat } from '@/components/chat/EmptyChat';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  useSocketEvents();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { activeChatId, setActiveChat } = useUIStore();

  useEffect(() => {
    setActiveChat(chatId ?? null);
  }, [chatId, setActiveChat]);

  const openChat = (id: string) => navigate(`/chat/${id}`);

  return (
    <div className="flex h-full overflow-hidden bg-surface-muted dark:bg-surface-dark">
      <aside
        className={cn(
          'flex w-full flex-col border-r border-slate-200 bg-white dark:border-surface-hover dark:bg-surface-dark md:w-[380px] md:shrink-0',
          activeChatId && 'hidden md:flex',
        )}
      >
        <Sidebar activeChatId={activeChatId} onOpenChat={openChat} />
      </aside>

      <main className={cn('flex-1', !activeChatId && 'hidden md:block')}>
        {activeChatId ? (
          <ChatWindow chatId={activeChatId} onBack={() => navigate('/')} />
        ) : (
          <EmptyChat />
        )}
      </main>
    </div>
  );
}
