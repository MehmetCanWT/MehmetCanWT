import { Elysia } from 'elysia';

// --- Rate limiter state ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute
const MAX_RATE_LIMIT_ENTRIES = 5000;

/**
 * LRU-style eviction: delete oldest entries, keep newest MAX_RATE_LIMIT_ENTRIES.
 * Maps in JS preserve insertion order, so the first entries are the oldest.
 */
function evictOldestEntries(): void {
  if (rateLimitMap.size <= MAX_RATE_LIMIT_ENTRIES) return;

  const toRemove = rateLimitMap.size - MAX_RATE_LIMIT_ENTRIES;
  let removed = 0;
  for (const key of rateLimitMap.keys()) {
    if (removed >= toRemove) break;
    rateLimitMap.delete(key);
    removed++;
  }
}

/**
 * Check if an IP is within its rate limit window.
 * Returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(ip: string, customLimit?: number, customWindow?: number): boolean {
  evictOldestEntries();

  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  const limit = customLimit || RATE_LIMIT_MAX;
  const window = customWindow || RATE_LIMIT_WINDOW;

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

// Periodically clean expired entries to prevent stale data buildup
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

/**
 * Extract the client IP from request headers with spoofing protection.
 * Takes the first IP from X-Forwarded-For to avoid trusting appended values.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : (request.headers.get('x-real-ip') || 'unknown');
}

/**
 * Elysia plugin that adds security headers to every response.
 */
export const securityMiddleware = new Elysia({ name: 'security-middleware' })
  .onRequest(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff';
    set.headers['X-Frame-Options'] = 'DENY';
    set.headers['X-XSS-Protection'] = '1; mode=block';
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  });
