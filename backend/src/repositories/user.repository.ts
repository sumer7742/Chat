import { BaseRepository } from './base.repository';
import { User, type IUser, type UserDocument } from '../models/User';

class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  findByEmail(email: string, withPassword = false): Promise<UserDocument | null> {
    const q = User.findOne({ email: email.toLowerCase() });
    if (withPassword) q.select('+password');
    return q.exec();
  }

  findByEmailOrUsername(identifier: string, withPassword = false): Promise<UserDocument | null> {
    const value = identifier.toLowerCase();
    const q = User.findOne({ $or: [{ email: value }, { username: identifier }] });
    if (withPassword) q.select('+password');
    return q.exec();
  }

  findByUsername(username: string): Promise<UserDocument | null> {
    return User.findOne({ username }).exec();
  }

  async search(term: string, excludeId: string, limit = 20): Promise<UserDocument[]> {
    const regex = new RegExp(escapeRegExp(term), 'i');
    return User.find({
      _id: { $ne: excludeId },
      $or: [{ username: regex }, { displayName: regex }, { email: regex }],
    })
      .limit(limit)
      .exec();
  }

  setOnline(userId: string, isOnline: boolean): Promise<void> {
    return User.updateOne(
      { _id: userId },
      { isOnline, lastSeen: new Date() },
    ).exec().then(() => undefined);
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const userRepository = new UserRepository();
