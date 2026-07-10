import type { Server, Socket } from 'socket.io';
import { presenceService } from '../../services/presence.service';
import { userRepository } from '../../repositories/user.repository';
import { chatRepository } from '../../repositories/chat.repository';
import { SocketEvent, room } from '../events';
import type { AuthedSocketData } from '../middleware';
import { logger } from '../../config/logger';

/**
 * On connect: join the personal room + all chat rooms, mark online, and notify
 * peers. On disconnect: flip offline only when the *last* socket of the user
 * closes (multi-tab safe).
 */
export async function onConnection(io: Server, socket: Socket): Promise<void> {
  const { userId } = socket.data as AuthedSocketData;

  socket.join(room.user(userId));

  const chats = await chatRepository.find({ 'members.user': userId }, { projection: { _id: 1 } });
  for (const chat of chats) socket.join(room.chat(chat._id.toString()));

  const becameOnline = await presenceService.addSocket(userId, socket.id);
  if (becameOnline) {
    await userRepository.setOnline(userId, true);
    io.emit(SocketEvent.Online, { userId, at: Date.now() });
  }

  logger.debug({ userId, socketId: socket.id }, 'socket connected');

  socket.on(SocketEvent.Disconnect, async () => {
    const wentOffline = await presenceService.removeSocket(userId, socket.id);
    if (wentOffline) {
      const lastSeen = new Date();
      await userRepository.setOnline(userId, false);
      io.emit(SocketEvent.Offline, { userId, lastSeen });
    }
    logger.debug({ userId, socketId: socket.id }, 'socket disconnected');
  });

  // Client can ask for the online-state of a set of users.
  socket.on(SocketEvent.PresenceState, async (userIds: string[], ack?: (online: string[]) => void) => {
    const online = await presenceService.filterOnline(Array.isArray(userIds) ? userIds : []);
    ack?.(online);
  });
}
