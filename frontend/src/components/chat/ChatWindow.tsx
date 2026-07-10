import { useChat } from '@/hooks/useChats';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
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
      <MessageList chatId={chatId} chat={chat} me={user ?? null} />
      <MessageComposer chatId={chatId} />
    </div>
  );
}
