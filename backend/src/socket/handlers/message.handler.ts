import type { Socket } from 'socket.io';
import { SocketEvent } from '../events';
import { messageService } from '../../services/message.service';
import type { AuthedSocketData } from '../middleware';
import { logger } from '../../config/logger';

interface SendPayload {
  chatId: string;
  type?: string;
  text?: string;
  attachments?: unknown[];
  replyTo?: string;
  mentions?: string[];
  metadata?: Record<string, unknown>;
  tempId?: string;
}

/**
 * Realtime message send/seen/delivered. The service is the single source of
 * truth — it persists and broadcasts via the emitter, so this handler only
 * validates ownership and acks the sender with the persisted message.
 */
export function registerMessageHandlers(socket: Socket): void {
  const { userId } = socket.data as AuthedSocketData;

  socket.on(
    SocketEvent.SendMessage,
    async (payload: SendPayload, ack?: (res: { ok: boolean; message?: unknown; error?: string; tempId?: string }) => void) => {
      try {
        const message = await messageService.send({
          chatId: payload.chatId,
          senderId: userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: payload.type as any,
          text: payload.text,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attachments: payload.attachments as any,
          replyTo: payload.replyTo,
          mentions: payload.mentions,
          metadata: payload.metadata,
        });
        ack?.({ ok: true, message: message.toJSON(), tempId: payload.tempId });
      } catch (err) {
        logger.warn({ err }, 'socket send-message failed');
        ack?.({ ok: false, error: err instanceof Error ? err.message : 'send failed', tempId: payload.tempId });
      }
    },
  );

  socket.on(SocketEvent.MessageDelivered, async ({ chatId }: { chatId: string }) => {
    try {
      await messageService.markDelivered(chatId, userId);
    } catch (err) {
      logger.debug({ err }, 'markDelivered failed');
    }
  });

  socket.on(
    SocketEvent.MessageSeen,
    async ({ chatId, upToMessageId }: { chatId: string; upToMessageId: string }) => {
      try {
        await messageService.markSeen(chatId, userId, upToMessageId);
      } catch (err) {
        logger.debug({ err }, 'markSeen failed');
      }
    },
  );
}
