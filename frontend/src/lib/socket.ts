import { io, type Socket } from 'socket.io-client';
import { tokenStore } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: (cb) => cb({ token: tokenStore.get() ?? '' }),
  });
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  socket?.disconnect();
}

/** Emit with a promise-based ack, timing out after `ms`. */
export function emitAck<T>(event: string, payload: unknown, ms = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    const timer = setTimeout(() => reject(new Error('Socket ack timeout')), ms);
    s.timeout(ms).emit(event, payload, (err: Error | null, res: T) => {
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(res);
    });
  });
}
