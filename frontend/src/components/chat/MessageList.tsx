import { useEffect, useMemo, useRef } from 'react';
import { format, isSameDay } from 'date-fns';
import type { Chat, User } from '@/types';
import { useMessages, flattenMessages } from '@/hooks/useMessages';
import { Spinner } from '@/components/ui/Spinner';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { getSocket } from '@/lib/socket';

function DayDivider({ date }: { date: string }) {
  return (
    <div className="my-3 flex justify-center">
      <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-500 shadow-sm dark:bg-surface-panel dark:text-slate-400">
        {format(new Date(date), 'MMMM d, yyyy')}
      </span>
    </div>
  );
}

export function MessageList({ chatId, chat, me }: { chatId: string; chat: Chat; me: User | null }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(chatId);
  const messages = useMemo(() => flattenMessages(data?.pages), [data]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const scrollBox = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  // Auto-scroll to bottom when a new latest message arrives (not on history load).
  useEffect(() => {
    if (messages.length === 0) return;
    const grewAtBottom = messages.length > lastCount.current;
    lastCount.current = messages.length;
    if (grewAtBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark newest incoming message as seen.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.sender._id === me?._id) return;
    const socket = getSocket();
    if (socket.connected) socket.emit('message-seen', { chatId, upToMessageId: last._id });
  }, [messages, chatId, me?._id]);

  // Infinite scroll upward via IntersectionObserver on the top sentinel.
  useEffect(() => {
    const el = topSentinel.current;
    const root = scrollBox.current;
    if (!el || !root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          const prevHeight = root.scrollHeight;
          fetchNextPage().then(() => {
            requestAnimationFrame(() => {
              root.scrollTop = root.scrollHeight - prevHeight;
            });
          });
        }
      },
      { root, threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="chat-bg flex flex-1 items-center justify-center">
        <Spinner size={26} />
      </div>
    );
  }

  return (
    <div ref={scrollBox} className="chat-bg scrollbar-thin flex-1 overflow-y-auto px-4 py-3 md:px-12">
      <div ref={topSentinel} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Spinner size={18} />
        </div>
      )}
      {messages.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500">No messages yet — say hello 👋</p>
      )}
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const showDay = !prev || !isSameDay(new Date(prev.createdAt), new Date(msg.createdAt));
        const grouped = !!prev && prev.sender._id === msg.sender._id && !showDay;
        return (
          <div key={msg._id}>
            {showDay && <DayDivider date={msg.createdAt} />}
            <MessageBubble
              message={msg}
              me={me}
              isGroup={chat.type !== 'private'}
              grouped={grouped}
              totalMembers={chat.members.length}
            />
          </div>
        );
      })}
      <TypingIndicator chatId={chatId} />
      <div ref={bottomRef} />
    </div>
  );
}
