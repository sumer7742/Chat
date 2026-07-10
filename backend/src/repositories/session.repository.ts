import { BaseRepository } from './base.repository';
import { Session, type ISession, type SessionDocument } from '../models/Session';

class SessionRepository extends BaseRepository<ISession> {
  constructor() {
    super(Session);
  }

  findActiveByUser(userId: string): Promise<SessionDocument[]> {
    return Session.find({ user: userId, revokedAt: { $exists: false } })
      .sort({ lastActiveAt: -1 })
      .exec();
  }

  findByRefreshHash(hash: string): Promise<SessionDocument | null> {
    return Session.findOne({ refreshTokenHash: hash, revokedAt: { $exists: false } }).exec();
  }

  revoke(sessionId: string): Promise<void> {
    return Session.updateOne({ _id: sessionId }, { revokedAt: new Date() })
      .exec()
      .then(() => undefined);
  }

  revokeAllForUser(userId: string, exceptSessionId?: string): Promise<number> {
    const filter: Record<string, unknown> = { user: userId, revokedAt: { $exists: false } };
    if (exceptSessionId) filter._id = { $ne: exceptSessionId };
    return Session.updateMany(filter, { revokedAt: new Date() })
      .exec()
      .then((r) => r.modifiedCount);
  }
}

export const sessionRepository = new SessionRepository();
