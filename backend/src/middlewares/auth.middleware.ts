import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { User } from '../models/User';
import { Session } from '../models/Session';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  if (typeof req.cookies?.accessToken === 'string') return req.cookies.accessToken;
  return null;
}

export const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  const payload = verifyAccessToken(token);

  const session = await Session.findOne({ _id: payload.sid, revokedAt: { $exists: false } });
  if (!session) throw ApiError.unauthorized('Session expired or revoked');

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  req.sessionId = payload.sid;
  next();
});

/** Non-throwing variant — populates req.user when a valid token is present. */
export const optionalAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return next();
    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (user) {
        req.user = user;
        req.sessionId = payload.sid;
      }
    } catch {
      /* ignore — treated as anonymous */
    }
    next();
  },
);
