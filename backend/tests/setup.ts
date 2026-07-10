import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Deterministic env for the test process (env.ts validates on import).
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_16_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_16_chars';
process.env.JWT_ACCESS_TTL = '15m';
process.env.JWT_REFRESH_TTL = '30d';

// In-memory Redis stand-in — covers the command surface used by the app.
vi.mock('../src/config/redis', () => {
  const store = new Map<string, string>();
  const sets = new Map<string, Set<string>>();
  const set = (k: string) => sets.get(k) ?? sets.set(k, new Set()).get(k)!;
  const stub = {
    get: async (k: string) => store.get(k) ?? null,
    set: async (k: string, v: string) => {
      store.set(k, v);
      return 'OK';
    },
    del: async (...ks: string[]) => {
      ks.forEach((k) => (store.delete(k), sets.delete(k)));
      return ks.length;
    },
    sadd: async (k: string, v: string) => (set(k).has(v) ? 0 : (set(k).add(v), 1)),
    srem: async (k: string, v: string) => (set(k).delete(v) ? 1 : 0),
    scard: async (k: string) => set(k).size,
    smembers: async (k: string) => [...set(k)],
    sismember: async (k: string, v: string) => (set(k).has(v) ? 1 : 0),
    call: async () => null,
    quit: async () => undefined,
    duplicate() {
      return stub;
    },
    on() {
      return stub;
    },
    pipeline() {
      const cmds: Array<[string, unknown[]]> = [];
      const chain = {
        sismember(k: string, v: string) {
          cmds.push(['sismember', [k, v]]);
          return chain;
        },
        async exec() {
          return Promise.all(
            cmds.map(async ([, [k, v]]) => [null, (await stub.sismember(k as string, v as string))]),
          );
        },
      };
      return chain;
    },
  };
  return { redis: stub, pubClient: stub, subClient: stub, disconnectRedis: async () => undefined };
});

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
