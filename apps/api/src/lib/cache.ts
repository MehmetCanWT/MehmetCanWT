import { Redis } from 'ioredis';

type CacheItem<T> = {
  data: T;
  expiry: number;
};

// Fallback in-memory map
const memoryCache = new Map<string, CacheItem<any>>();

// Initialize Redis if URL is provided
let redisClient: Redis | null = null;
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
      console.warn("⚠️ Redis Connection Error. Falling back to memory cache.");
      redisClient = null;
    });
    console.log("✅ Redis Cache client initialized.");
  } catch (e) {
    console.warn("⚠️ Failed to initialize Redis. Running with memory cache.");
  }
} else {
  console.log("ℹ️ No REDIS_URL provided. Running with memory cache.");
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
  if (redisClient) {
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
      return cached.data;
    }
  }

  // Fetch new data
  const data = await fetcher();

  // Save to Cache
  if (redisClient) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(data));
    } catch (e) {
      console.warn(`Redis set error for ${key}`, e);
    }
  } else {
    memoryCache.set(key, {
      data,
      expiry: now + ttl * 1000,
    });
  }

  return data;
}
