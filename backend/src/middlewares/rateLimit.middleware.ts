import rateLimit, { type Store } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis, redisEnabled } from '../config/redis';
import { env, isTest } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * express-rate-limit v7 forbids sharing one Store across limiters, so each
 * limiter gets its own RedisStore with a unique key prefix. In tests (mocked
 * Redis) or when Redis is disabled we fall back to the built-in memory store.
 */
function makeStore(prefix: string): Store | undefined {
  if (isTest || !redisEnabled) return undefined;
  return new RedisStore({
    prefix,
    // ioredis `call` shim required by rate-limit-redis v4.
    sendCommand: (...args: string[]) =>
      (redis.call as unknown as (...a: string[]) => Promise<never>)(...args),
  });
}

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: isTest ? 100_000 : env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:api:'),
  handler: () => {
    throw ApiError.tooMany();
  },
});

/** Stricter limiter for auth endpoints (login, OTP, reset) to slow brute-force. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 100_000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: makeStore('rl:auth:'),
  handler: () => {
    throw ApiError.tooMany('Too many attempts, please try again later');
  },
});
