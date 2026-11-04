import { Redis } from 'ioredis';
import { db, adminConfig } from 'db';
import { eq } from 'drizzle-orm';

type CacheItem<T> = {
  data: T;
  expiry: number;
  createdAt: number;
};

// Max memory cache entries before evicting oldest
const MAX_MEMORY_CACHE_SIZE = 100;

// Fallback in-memory map
const memoryCache = new Map<string, CacheItem<unknown>>();

// Initialize Redis if URL is provided
let redisClient: Redis | null = null;
let redisAvailable = false;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 50, 2000);
      }
    });
    redisClient.on('error', () => {
      if (redisAvailable) {
        console.warn("⚠️ Redis Connection Error. Falling back to DB / memory cache until reconnected.");
        redisAvailable = false;
      }
    });
    redisClient.on('connect', () => {
      console.log("✅ Redis Cache client connected.");
      redisAvailable = true;
    });
  } catch (e) {
    console.warn("⚠️ Failed to initialize Redis. Running with DB / memory cache.");
  }
}

/**
 * Periodically clean expired entries from the memory cache.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryCache) {
    if (item.expiry <= now) {
      memoryCache.delete(key);
    }
  }
}, 5 * 60_000);

/**
 * Evict the oldest entries if memory cache exceeds size limit.
 */
function enforceMemoryCacheLimit(): void {
  if (memoryCache.size <= MAX_MEMORY_CACHE_SIZE) return;

  const entries = [...memoryCache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
  const toRemove = entries.length - MAX_MEMORY_CACHE_SIZE;

  for (let i = 0; i < toRemove; i++) {
    memoryCache.delete(entries[i][0]);
  }
}

/**
 * Gets a value from cache or fetches it if missing/expired.
 * Caches in PostgreSQL (6-hour persistence) + Redis + Memory.
 * @param key Unique cache key
 * @param ttl Time to live in seconds (default 21600 = 6 hours)
 * @param fetcher Function to fetch data if cache misses
 */
export async function withCache<T>(key: string, ttl: number = 21600, fetcher: () => Promise<T>): Promise<T> {
  const effectiveTtl = Math.max(ttl, 21600); // Strictly enforce 6 hours
  const now = Date.now();

  // 1. Hot memory cache check
  const memCached = memoryCache.get(key);
  if (memCached && memCached.expiry > now) {
    return memCached.data as T;
  }

  // 2. Persistent Database check (PostgreSQL admin_config)
  if (db) {
    try {
      const dbRows = await db.select().from(adminConfig).where(eq(adminConfig.key, `cache:${key}`)).limit(1);
      if (dbRows.length > 0) {
        const row = dbRows[0];
        const age = now - new Date(row.updatedAt).getTime();
        if (age < effectiveTtl * 1000) {
          const parsed = JSON.parse(row.value) as T;
          // Hydrate memory cache
          memoryCache.set(key, {
            data: parsed,
            expiry: now + (effectiveTtl * 1000 - age),
            createdAt: new Date(row.updatedAt).getTime(),
          });
          return parsed;
        }
      }
    } catch (dbErr) {
      console.warn(`[Cache DB read error for ${key}]:`, dbErr);
    }
  }

  // 3. Try Redis
  if (redisClient && redisAvailable) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        const parsed = JSON.parse(cached) as T;
        memoryCache.set(key, {
          data: parsed,
          expiry: now + effectiveTtl * 1000,
          createdAt: now,
        });
        return parsed;
      }
    } catch (e) {
      console.warn(`Redis get error for ${key}`, e);
    }
  }

  // 4. Fetch new fresh data
  const data = await fetcher();

  // 5. Persist to PostgreSQL (Neon)
  if (db && data !== undefined && data !== null) {
    try {
      const jsonStr = JSON.stringify(data);
      await db.insert(adminConfig).values({
        key: `cache:${key}`,
        value: jsonStr,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: adminConfig.key,
        set: {
          value: jsonStr,
          updatedAt: new Date(),
        }
      });
    } catch (dbWriteErr) {
      console.warn(`[Cache DB write error for ${key}]:`, dbWriteErr);
    }
  }

  // 6. Save to Redis
  if (redisClient && redisAvailable) {
    try {
      await redisClient.setex(key, effectiveTtl, JSON.stringify(data));
    } catch (e) {
      console.warn(`Redis set error for ${key}`, e);
    }
  }

  // 7. Save to Memory
  memoryCache.set(key, {
    data,
    expiry: now + effectiveTtl * 1000,
    createdAt: now,
  });
  enforceMemoryCacheLimit();

  return data;
}

/**
 * Invalidate a specific cache key from Database, Redis and memory.
 */
export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key);

  if (db) {
    try {
      await db.delete(adminConfig).where(eq(adminConfig.key, `cache:${key}`));
    } catch (e) {
      console.warn(`Failed to delete DB cache for ${key}`, e);
    }
  }

  if (redisClient && redisAvailable) {
    try {
      await redisClient.del(key);
    } catch (e) {
      console.warn(`Redis invalidate error for ${key}`, e);
    }
  }
}

/**
 * Invalidate all cached data keys.
 */
export async function invalidateAllCache(): Promise<void> {
  memoryCache.clear();
  if (db) {
    try {
      const allCacheRows = await db.select().from(adminConfig);
      for (const row of allCacheRows) {
        if (row.key.startsWith('cache:')) {
          await db.delete(adminConfig).where(eq(adminConfig.id, row.id));
        }
      }
    } catch (e) {
      console.warn("Failed to clear DB cache table:", e);
    }
  }
}
