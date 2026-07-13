import { useCallback } from 'react';
import { emitAck, getSocket } from '@/lib/socket';
import { messageService, type SendMessageBody } from '@/services/message.service';
import { queryClient, queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';
import type { Message } from '@/types';

type MessagesCache = { pages: { messages: Message[]; hasMore: boolean }[]; pageParams: unknown[] } | undefined;

/** Insert an optimistic (pending) message at the front of the newest page. */
function insertOptimistic(chatId: string, msg: Message) {
  queryClient.setQueryData<MessagesCache>(queryKeys.messages(chatId), (old) => {
    if (!old) return old;
    const pages = old.pages.slice();
    pages[0] = { ...pages[0]!, messages: [msg, ...(pages[0]?.messages ?? [])] };
    return { ...old, pages };
  });
}

/** Swap the pending message for the server's canonical one (dedupe by _id). */
function reconcile(chatId: string, tempId: string, real?: Message) {
  queryClient.setQueryData<MessagesCache>(queryKeys.messages(chatId), (old) => {
    if (!old) return old;
    const pages = old.pages.map((p) => ({
      ...p,
      messages: p.messages.filter((m) => m.tempId !== tempId),
    }));
    if (real && !pages.some((p) => p.messages.some((m) => m._id === real._id))) {
      pages[0] = { ...pages[0]!, messages: [real, ...(pages[0]?.messages ?? [])] };
    }
    return { ...old, pages };
  });
}

/**
 * Sends via socket for low latency. To keep the UI instant regardless of network
 * latency (e.g. a cloud backend), we optimistically render the message right away
 * and reconcile once the server acks / broadcasts the canonical copy.
 */
export function useSendMessage(chatId: string) {
  return useCallback(
    async (body: SendMessageBody): Promise<void> => {
      const me = useAuthStore.getState().user;
      const socket = getSocket();
      // Optimistic only for text-ish messages (attachments have no local URL yet).
      const canOptimistic = !!me && !body.attachments?.length;
      let tempId: string | undefined;

      if (me && canOptimistic) {
        tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const now = new Date().toISOString();
        const optimistic: Message = {
          _id: tempId,
          tempId,
          pending: true,
          chat: chatId,
          sender: { _id: me._id, username: me.username, displayName: me.displayName, avatarUrl: me.avatarUrl },
          type: (body.type as Message['type']) ?? 'text',
          text: body.text,
          attachments: [],
          mentions: [],
          reactions: [],
          status: 'sent',
          deliveredTo: [],
          seenBy: [],
          starredBy: [],
          isDeleted: false,
          isEdited: false,
          createdAt: now,
          updatedAt: now,
        };
        insertOptimistic(chatId, optimistic);
      }

      try {
        if (socket.connected) {
          const res = await emitAck<{ ok: boolean; message?: Message; error?: string }>('send-message', {
            chatId,
            ...body,
          });
          if (!res.ok) throw new Error(res.error ?? 'Failed to send');
          if (tempId) reconcile(chatId, tempId, res.message);
        } else {
          const msg = await messageService.send(chatId, body);
          if (tempId) reconcile(chatId, tempId, msg);
        }
      } catch (e) {
        if (tempId) reconcile(chatId, tempId); // drop the pending bubble on failure
        throw e;
      }
    },
    [chatId],
  );
}
