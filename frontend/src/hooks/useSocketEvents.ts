import { useEffect } from 'react';
import { connectSocket, getSocket } from '@/lib/socket';
import { queryClient, queryKeys } from '@/lib/queryClient';
import { usePresenceStore } from '@/store/presenceStore';
import { useAuthStore } from '@/store/authStore';
import type { Chat, Message, Notification } from '@/types';

/**
 * Mounts once at the app root. Opens the authenticated socket and translates
 * server events into React Query cache updates + presence store mutations.
 */
export function useSocketEvents() {
  const userId = useAuthStore((s) => s.user?._id);

  useEffect(() => {
    if (!userId) return;
    const socket = connectSocket();
    const presence = usePresenceStore.getState();

    const upsertMessage = (msg: Message) => {
      queryClient.setQueryData<{ pages: { messages: Message[]; hasMore: boolean }[] } | undefined>(
        queryKeys.messages(msg.chat),
        (old) => {
          if (!old) return old;
          const exists = old.pages.some((p) => p.messages.some((m) => m._id === msg._id));
          if (exists) return old;
          const pages = old.pages.slice();
          pages[0] = { ...pages[0]!, messages: [msg, ...(pages[0]?.messages ?? [])] };
          return { ...old, pages };
        },
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    };

    const onReceive = (msg: Message) => upsertMessage(msg);

    const onEdited = (msg: Message) => {
      queryClient.setQueryData<{ pages: { messages: Message[] }[] } | undefined>(
        queryKeys.messages(msg.chat),
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  messages: p.messages.map((m) => (m._id === msg._id ? msg : m)),
                })),
              }
            : old,
      );
    };

    const onDeleted = ({ messageId, forEveryone }: { messageId: string; forEveryone: boolean }) => {
      queryClient.setQueriesData<{ pages: { messages: Message[] }[] } | undefined>(
        { queryKey: ['messages'] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  messages: forEveryone
                    ? p.messages.map((m) => (m._id === messageId ? { ...m, isDeleted: true, text: '' } : m))
                    : p.messages.filter((m) => m._id !== messageId),
                })),
              }
            : old,
      );
    };

    const onReaction = ({ messageId, reactions }: { messageId: string; reactions: Message['reactions'] }) => {
      queryClient.setQueriesData<{ pages: { messages: Message[] }[] } | undefined>(
        { queryKey: ['messages'] },
        (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((p) => ({
                  ...p,
                  messages: p.messages.map((m) => (m._id === messageId ? { ...m, reactions } : m)),
                })),
              }
            : old,
      );
    };

    const onChatUpdated = (_chat: Chat) => queryClient.invalidateQueries({ queryKey: queryKeys.chats });
    const onNotification = (_n: Notification) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };
    const onOnline = ({ userId: id }: { userId: string }) => presence.setOnline(id, true);
    const onOffline = ({ userId: id, lastSeen }: { userId: string; lastSeen: string }) =>
      presence.setOnline(id, false, lastSeen);
    const onTyping = ({ chatId, userId: id, displayName }: { chatId: string; userId: string; displayName: string }) =>
      presence.setTyping(chatId, id, displayName, true);
    const onStopTyping = ({ chatId, userId: id }: { chatId: string; userId: string }) =>
      presence.setTyping(chatId, id, '', false);
    const onActivity = ({ chatId, userId: id, kind }: { chatId: string; userId: string; kind: string }) =>
      presence.setActivity(chatId, id, kind);

    socket.on('receive-message', onReceive);
    socket.on('message-edited', onEdited);
    socket.on('message-deleted', onDeleted);
    socket.on('message-reaction', onReaction);
    socket.on('chat-updated', onChatUpdated);
    socket.on('notification', onNotification);
    socket.on('online', onOnline);
    socket.on('offline', onOffline);
    socket.on('typing', onTyping);
    socket.on('stop-typing', onStopTyping);
    socket.on('activity', onActivity);

    return () => {
      socket.off('receive-message', onReceive);
      socket.off('message-edited', onEdited);
      socket.off('message-deleted', onDeleted);
      socket.off('message-reaction', onReaction);
      socket.off('chat-updated', onChatUpdated);
      socket.off('notification', onNotification);
      socket.off('online', onOnline);
      socket.off('offline', onOffline);
      socket.off('typing', onTyping);
      socket.off('stop-typing', onStopTyping);
      socket.off('activity', onActivity);
    };
  }, [userId]);

  return getSocket();
}
