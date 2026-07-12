import type { Server } from 'socket.io';
import { SocketEvent, room } from './events';

/**
 * Decouples the domain/service layer from Socket.IO. The HTTP-side services call
 * these helpers to broadcast realtime updates without importing the io server
 * directly (which would create a circular dependency with the socket bootstrap).
 */
let io: Server | null = null;

export function bindIo(server: Server): void {
  io = server;
}

function emitToChat(chatId: string, event: SocketEvent, payload: unknown): void {
  io?.to(room.chat(chatId)).emit(event, payload);
}

function emitToUser(userId: string, event: SocketEvent, payload: unknown): void {
  io?.to(room.user(userId)).emit(event, payload);
}

export const realtime = {
  messageCreated(chatId: string, message: unknown): void {
    emitToChat(chatId, SocketEvent.ReceiveMessage, message);
  },
  messageEdited(chatId: string, message: unknown): void {
    emitToChat(chatId, SocketEvent.MessageEdited, message);
  },
  messageDeleted(chatId: string, payload: { messageId: string; forEveryone: boolean }): void {
    emitToChat(chatId, SocketEvent.MessageDeleted, payload);
  },
  reactionChanged(chatId: string, payload: unknown): void {
    emitToChat(chatId, SocketEvent.MessageReaction, payload);
  },
  chatUpdated(chatId: string, chat: unknown): void {
    emitToChat(chatId, SocketEvent.ChatUpdated, chat);
  },
  notify(userId: string, notification: unknown): void {
    emitToUser(userId, SocketEvent.Notification, notification);
  },
  userUpdated(userId: string, patch: unknown): void {
    emitToUser(userId, SocketEvent.UserUpdated, patch);
  },
  coupleUpdated(userId: string, patch: unknown): void {
    emitToUser(userId, SocketEvent.CoupleUpdated, patch);
  },
  toChat: emitToChat,
  toUser: emitToUser,
};
