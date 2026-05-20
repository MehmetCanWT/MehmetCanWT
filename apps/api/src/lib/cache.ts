import { Redis } from 'ioredis';

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
      // Don't null the client — allow ioredis to attempt reconnection
      if (redisAvailable) {
        console.warn("⚠️ Redis Connection Error. Falling back to memory cache until reconnected.");
        redisAvailable = false;
      }
    });
    redisClient.on('connect', () => {
      console.log("✅ Redis Cache client connected.");
      redisAvailable = true;
    });
    console.log("✅ Redis Cache client initialized.");
  } catch (e) {
    console.warn("⚠️ Failed to initialize Redis. Running with memory cache.");
  }
} else {
  console.log("ℹ️ No REDIS_URL provided. Running with memory cache.");
}

/**
 * Periodically clean expired entries from the memory cache.
 * Runs every 5 minutes to keep memory usage lean.
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

  // Sort entries by createdAt ascending (oldest first)
  const entries = [...memoryCache.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt);
  const toRemove = entries.length - MAX_MEMORY_CACHE_SIZE;

  for (let i = 0; i < toRemove; i++) {
    memoryCache.delete(entries[i][0]);
  }
}

/**
 * Gets a value from cache or fetches it if missing/expired.
 * @param key Unique cache key
 * @param ttl Time to live in seconds
 * @param fetcher Function to fetch data if cache misses
 */
export async function withCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();

  // Try Redis first
  if (redisClient && redisAvailable) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (e) {
      console.warn(`Redis get error for ${key}`, e);
    }
  } else {
    // Memory Cache Fallback
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > now) {
      return cached.data as T;
    }
  }

  // Fetch new data
  const data = await fetcher();

  // Save to Cache
  if (redisClient && redisAvailable) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(data));
    } catch (e) {
      console.warn(`Redis set error for ${key}`, e);
    }
  } else {
    memoryCache.set(key, {
      data,
      expiry: now + ttl * 1000,
      createdAt: now,
    });
    enforceMemoryCacheLimit();
  }

  return data;
}

/**
 * Invalidate a specific cache key from both Redis and memory.
 * Useful for forcing a refresh on the next request.
 */
export async function invalidateCache(key: string): Promise<void> {
  memoryCache.delete(key);

  if (redisClient && redisAvailable) {
    try {
      await redisClient.del(key);
    } catch (e) {
      console.warn(`Redis invalidate error for ${key}`, e);
    }
  }
}
