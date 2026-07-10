import { useCallback } from 'react';
import { emitAck, getSocket } from '@/lib/socket';
import { messageService, type SendMessageBody } from '@/services/message.service';
import type { Message } from '@/types';

/**
 * Sends via socket for low latency (server persists + broadcasts to the room,
 * so the sender receives the canonical message through `receive-message` and we
 * avoid client-side duplication). Falls back to REST if the socket is down.
 */
export function useSendMessage(chatId: string) {
  return useCallback(
    async (body: SendMessageBody): Promise<void> => {
      const socket = getSocket();
      if (socket.connected) {
        const res = await emitAck<{ ok: boolean; message?: Message; error?: string }>('send-message', {
          chatId,
          ...body,
        });
        if (!res.ok) throw new Error(res.error ?? 'Failed to send');
        return;
      }
      await messageService.send(chatId, body);
    },
    [chatId],
  );
}
