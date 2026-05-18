type CacheItem<T> = {
  data: T;
  expiry: number;
};

const cache = new Map<string, CacheItem<any>>();

/**
 * Gets a value from cache or fetches it if missing/expired.
 * @param key Unique cache key
 * @param ttl Time to live in seconds
 * @param fetcher Function to fetch data if cache misses
 */
export async function withCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiry > now) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, {
    data,
    expiry: now + ttl * 1000,
  });

  return data;
}
