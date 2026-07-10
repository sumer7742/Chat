import { Redis } from 'ioredis';
import { env } from './env';
import { logger } from './logger';

/**
 * Redis powers cache (OTP/reset), presence, rate-limiting and the Socket.IO
 * fan-out adapter. For single-instance local development it is optional: leave
 * REDIS_URL empty (or set REDIS_DISABLED=true) and an in-process memory stub is
 * used instead — no external Redis required. For production / horizontal
 * scaling, point REDIS_URL at a real Redis so events fan out across instances.
 */
export const redisEnabled = Boolean(env.REDIS_URL) && process.env.REDIS_DISABLED !== 'true';

// Minimal in-memory implementation of the Redis command surface the app uses.
function createMemoryClient(): Redis {
  const store = new Map<string, string>();
  const expiries = new Map<string, NodeJS.Timeout>();
  const sets = new Map<string, Set<string>>();
  const setOf = (k: string) => sets.get(k) ?? sets.set(k, new Set()).get(k)!;

  const client = {
    async get(k: string) {
      return store.get(k) ?? null;
    },
    async set(k: string, v: string, ex?: string, ttl?: number) {
      store.set(k, v);
      const prev = expiries.get(k);
      if (prev) clearTimeout(prev);
      if (ex === 'EX' && ttl) {
        expiries.set(
          k,
          setTimeout(() => {
            store.delete(k);
            expiries.delete(k);
          }, ttl * 1000),
        );
      }
      return 'OK';
    },
    async del(...ks: string[]) {
      let n = 0;
      for (const k of ks) {
        if (store.delete(k)) n++;
        sets.delete(k);
      }
      return n;
    },
    async sadd(k: string, v: string) {
      return setOf(k).has(v) ? 0 : (setOf(k).add(v), 1);
    },
    async srem(k: string, v: string) {
      return setOf(k).delete(v) ? 1 : 0;
    },
    async scard(k: string) {
      return setOf(k).size;
    },
    async smembers(k: string) {
      return [...setOf(k)];
    },
    async sismember(k: string, v: string) {
      return setOf(k).has(v) ? 1 : 0;
    },
    async call() {
      return null;
    },
    async quit() {
      return 'OK';
    },
    duplicate() {
      return client;
    },
    on() {
      return client;
    },
    pipeline() {
      const cmds: Array<() => Promise<unknown>> = [];
      const chain = {
        sismember(k: string, v: string) {
          cmds.push(() => client.sismember(k, v));
          return chain;
        },
        async exec() {
          return Promise.all(cmds.map(async (c) => [null, await c()]));
        },
      };
      return chain;
    },
  };
  return client as unknown as Redis;
}

function build(label: string): Redis {
  if (!redisEnabled) return createMemoryClient();
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
  });
  client.on('connect', () => logger.info(`Redis[${label}] connected`));
  client.on('error', (err) => logger.error({ err }, `Redis[${label}] error`));
  return client;
}

if (!redisEnabled) {
  logger.warn('Redis disabled — using in-memory stub (single instance only). Set REDIS_URL to enable.');
}

export const redis = build('main');
export const pubClient = build('pub');
// `.duplicate()` does not copy listeners — attach its own error handler so an
// error on the sub connection can never become an unhandled 'error' event.
export const subClient = pubClient.duplicate();
if (redisEnabled) {
  subClient.on('connect', () => logger.info('Redis[sub] connected'));
  subClient.on('error', (err) => logger.error({ err }, 'Redis[sub] error'));
}

export async function disconnectRedis(): Promise<void> {
  await Promise.allSettled([redis.quit(), pubClient.quit(), subClient.quit()]);
}
