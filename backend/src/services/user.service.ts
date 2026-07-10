import { Types } from 'mongoose';
import { userRepository } from '../repositories/user.repository';
import { sessionRepository } from '../repositories/session.repository';
import { presenceService } from './presence.service';
import { ApiError } from '../utils/ApiError';
import type { UserDocument, IUserPrivacy } from '../models/User';

export interface ProfileUpdate {
  displayName?: string;
  bio?: string;
  username?: string;
  avatarUrl?: string;
}

class UserService {
  async getById(id: string): Promise<UserDocument> {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateProfile(userId: string, update: ProfileUpdate): Promise<UserDocument> {
    if (update.username) {
      const taken = await userRepository.findByUsername(update.username);
      if (taken && taken._id.toString() !== userId) {
        throw ApiError.conflict('Username already taken');
      }
    }
    const user = await userRepository.updateById(userId, update);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updatePrivacy(userId: string, privacy: Partial<IUserPrivacy>): Promise<UserDocument> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    user.privacy = { ...user.privacy, ...privacy };
    await user.save();
    return user;
  }

  async search(term: string, requesterId: string): Promise<UserDocument[]> {
    const results = await userRepository.search(term, requesterId);
    const online = new Set(
      await presenceService.filterOnline(results.map((u) => u._id.toString())),
    );
    return results.map((u) => {
      u.isOnline = online.has(u._id.toString());
      return u;
    });
  }

  async block(userId: string, targetId: string): Promise<void> {
    if (userId === targetId) throw ApiError.badRequest('You cannot block yourself');
    await userRepository.updateById(userId, {
      $addToSet: { blockedUsers: new Types.ObjectId(targetId) },
    });
  }

  async unblock(userId: string, targetId: string): Promise<void> {
    await userRepository.updateById(userId, {
      $pull: { blockedUsers: new Types.ObjectId(targetId) },
    });
  }

  async mute(userId: string, targetId: string): Promise<void> {
    await userRepository.updateById(userId, {
      $addToSet: { mutedUsers: new Types.ObjectId(targetId) },
    });
  }

  async unmute(userId: string, targetId: string): Promise<void> {
    await userRepository.updateById(userId, {
      $pull: { mutedUsers: new Types.ObjectId(targetId) },
    });
  }

  async listSessions(userId: string, currentSessionId?: string) {
    const sessions = await sessionRepository.findActiveByUser(userId);
    return sessions.map((s) => ({
      id: s._id.toString(),
      deviceName: s.deviceName,
      ip: s.ip,
      userAgent: s.userAgent,
      lastActiveAt: s.lastActiveAt,
      current: s._id.toString() === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await sessionRepository.findById(sessionId);
    if (!session || session.user.toString() !== userId) {
      throw ApiError.notFound('Session not found');
    }
    await sessionRepository.revoke(sessionId);
  }
}

export const userService = new UserService();
