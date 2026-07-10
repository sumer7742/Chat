import { redis } from '../config/redis';

/**
 * Small typed façade over Redis for short-lived auth artifacts (OTP codes,
 * password-reset tokens, failed-attempt counters) and generic JSON caching.
 */
class CacheService {
  private otpKey(email: string): string {
    return `otp:verify:${email.toLowerCase()}`;
  }
  private resetKey(tokenHash: string): string {
    return `pwreset:${tokenHash}`;
  }

  async setOtp(email: string, otp: string, ttlSeconds: number): Promise<void> {
    await redis.set(this.otpKey(email), otp, 'EX', ttlSeconds);
  }

  async getOtp(email: string): Promise<string | null> {
    return redis.get(this.otpKey(email));
  }

  async clearOtp(email: string): Promise<void> {
    await redis.del(this.otpKey(email));
  }

  async setResetToken(tokenHash: string, userId: string, ttlSeconds: number): Promise<void> {
    await redis.set(this.resetKey(tokenHash), userId, 'EX', ttlSeconds);
  }

  async consumeResetToken(tokenHash: string): Promise<string | null> {
    const key = this.resetKey(tokenHash);
    const userId = await redis.get(key);
    if (userId) await redis.del(key);
    return userId;
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}

export const cacheService = new CacheService();
