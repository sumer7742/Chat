import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { corsOrigins } from '../config/env';
import { pubClient, subClient, redisEnabled } from '../config/redis';
import { logger } from '../config/logger';
import { socketAuth } from './middleware';
import { bindIo } from './emitter';
import { onConnection } from './handlers/presence.handler';
import { registerChatHandlers } from './handlers/chat.handler';
import { registerMessageHandlers } from './handlers/message.handler';
import { registerCallHandlers } from './handlers/call.handler';

let io: Server | null = null;

export function getIo(): Server | null {
  return io;
}

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 5 * 1024 * 1024,
    pingTimeout: 30_000,
  });

  // Redis adapter → events fan out across all API instances (horizontal
  // scaling). Skipped in single-instance mode when Redis is disabled.
  if (redisEnabled) {
    io.adapter(createAdapter(pubClient, subClient));
  }

  bindIo(io);
  io.use(socketAuth);

  io.on('connection', (socket) => {
    void onConnection(io!, socket);
    registerChatHandlers(socket);
    registerMessageHandlers(socket);
    registerCallHandlers(io!, socket);
  });

  logger.info(`Socket.IO initialized${redisEnabled ? ' with Redis adapter' : ' (single instance)'}`);
  return io;
}
