import { useChat } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { FloatingHearts } from '@/components/love/FloatingHearts';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';

export function ChatWindow({ chatId, onBack }: { chatId: string; onBack: () => void }) {
  const { user } = useAuth();
  const { data: chat, isLoading } = useChat(chatId);

  if (isLoading || !chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader chat={chat} me={user ?? null} onBack={onBack} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10 opacity-30">
          <FloatingHearts count={7} />
        </div>
        <MessageList chatId={chatId} chat={chat} me={user ?? null} />
      </div>
      <MessageComposer chatId={chatId} />
    </div>
  );
}
