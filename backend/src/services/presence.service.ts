import { redis } from '../config/redis';

/**
 * Redis-backed presence. A user can have multiple concurrent sockets (tabs,
 * devices); we keep a per-user set of socket ids and treat the user as online
 * while that set is non-empty. Works across horizontally-scaled API instances
 * because the source of truth is shared Redis, not in-process memory.
 */
const KEY = (userId: string) => `presence:user:${userId}`;
const ONLINE_SET = 'presence:online';

class PresenceService {
  async addSocket(userId: string, socketId: string): Promise<boolean> {
    const added = await redis.sadd(KEY(userId), socketId);
    await redis.sadd(ONLINE_SET, userId);
    const count = await redis.scard(KEY(userId));
    // first socket → user transitioned to online
    return added === 1 && count === 1;
  }

  async removeSocket(userId: string, socketId: string): Promise<boolean> {
    await redis.srem(KEY(userId), socketId);
    const count = await redis.scard(KEY(userId));
    if (count === 0) {
      await redis.del(KEY(userId));
      await redis.srem(ONLINE_SET, userId);
      return true; // user went offline
    }
    return false;
  }

  async isOnline(userId: string): Promise<boolean> {
    return (await redis.sismember(ONLINE_SET, userId)) === 1;
  }

  async filterOnline(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];
    const pipeline = redis.pipeline();
    userIds.forEach((id) => pipeline.sismember(ONLINE_SET, id));
    const res = await pipeline.exec();
    return userIds.filter((_, i) => res?.[i]?.[1] === 1);
  }

  async socketsOf(userId: string): Promise<string[]> {
    return redis.smembers(KEY(userId));
  }
}

export const presenceService = new PresenceService();
