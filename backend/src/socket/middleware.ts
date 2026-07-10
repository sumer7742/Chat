import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { Session } from '../models/Session';
import { User } from '../models/User';

export interface AuthedSocketData {
  userId: string;
  sessionId: string;
  displayName: string;
}

function tokenFromSocket(socket: Socket): string | null {
  const auth = socket.handshake.auth?.token as string | undefined;
  if (auth) return auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  const header = socket.handshake.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  const cookie = socket.handshake.headers.cookie;
  if (cookie) {
    const match = /accessToken=([^;]+)/.exec(cookie);
    if (match) return decodeURIComponent(match[1]!);
  }
  return null;
}

/** Rejects unauthenticated handshakes and attaches user context to socket.data. */
export async function socketAuth(socket: Socket, next: (err?: Error) => void): Promise<void> {
  try {
    const token = tokenFromSocket(socket);
    if (!token) throw new Error('Authentication required');

    const payload = verifyAccessToken(token);
    const session = await Session.findOne({ _id: payload.sid, revokedAt: { $exists: false } });
    if (!session) throw new Error('Session revoked');

    const user = await User.findById(payload.sub).select('displayName');
    if (!user) throw new Error('User not found');

    (socket.data as AuthedSocketData) = {
      userId: payload.sub,
      sessionId: payload.sid,
      displayName: user.displayName,
    };
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Unauthorized'));
  }
}
