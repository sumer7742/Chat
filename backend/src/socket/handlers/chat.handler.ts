import type { Socket } from 'socket.io';
import { SocketEvent, room } from '../events';
import type { AuthedSocketData } from '../middleware';

/** Explicit room join/leave + typing & activity relays scoped to a chat room. */
export function registerChatHandlers(socket: Socket): void {
  const { userId, displayName } = socket.data as AuthedSocketData;

  socket.on(SocketEvent.JoinChat, (chatId: string) => {
    if (typeof chatId === 'string') socket.join(room.chat(chatId));
  });

  socket.on(SocketEvent.LeaveChat, (chatId: string) => {
    if (typeof chatId === 'string') socket.leave(room.chat(chatId));
  });

  socket.on(SocketEvent.Typing, (chatId: string) => {
    socket.to(room.chat(chatId)).emit(SocketEvent.Typing, { chatId, userId, displayName });
  });

  socket.on(SocketEvent.StopTyping, (chatId: string) => {
    socket.to(room.chat(chatId)).emit(SocketEvent.StopTyping, { chatId, userId });
  });

  // Recording audio / uploading / downloading — generic activity relay.
  socket.on(SocketEvent.Activity, (payload: { chatId: string; kind: string }) => {
    if (!payload?.chatId) return;
    socket.to(room.chat(payload.chatId)).emit(SocketEvent.Activity, {
      chatId: payload.chatId,
      userId,
      kind: payload.kind,
    });
  });
}
