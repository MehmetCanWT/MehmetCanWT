import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysia/jwt';
import { swagger } from '@elysiajs/swagger';
import { db, anime, games, guestbook } from 'db';
import { eq, desc } from 'drizzle-orm';
import { getAllAnime, getAnimeById } from './lib/anilist';
import { getAllGames } from './lib/steam';
import { getMixedNews } from './lib/news';
import { getDailyQuote } from './lib/quotes';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import React from 'react';
import { createHash, timingSafeEqual } from 'crypto';

const isProd = process.env.NODE_ENV === 'production';
const STEAM_ID = process.env.STEAM_ID || '76561198200466026';

if (!process.env.JWT_SECRET) {
  if (isProd) {
    console.error("FATAL: JWT_SECRET is not set in production!");
    process.exit(1);
  }
  console.warn("⚠️ JWT_SECRET not set. Using insecure dev fallback.");
}
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'fallback_dev_secret_change_me';

// Fetch font once on start (Safe fetch)
let fontData: ArrayBuffer;
try {
  fontData = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Black.ttf').then(res => res.arrayBuffer());
} catch (e) {
  console.warn("Could not fetch font for OG image, using fallback logic.");
}

// --- Rate limiter for guestbook and login ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute
const MAX_RATE_LIMIT_ENTRIES = 5000;

function checkRateLimit(ip: string, customLimit?: number, customWindow?: number): boolean {
  // LRU eviction instead of nuclear clear
  if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    const now = Date.now();
    // First pass: remove expired entries
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    // If still too big, remove oldest entries
    if (rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
      const entries = [...rateLimitMap.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
      const toRemove = entries.length - MAX_RATE_LIMIT_ENTRIES;
      for (let i = 0; i < toRemove; i++) {
        rateLimitMap.delete(entries[i][0]);
      }
    }
  }

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

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// --- Helpers ---
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  return forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

interface PinBody {
  id: number;
  isPinned: boolean;
  title: string;
}

async function pinEntity(
  table: typeof anime | typeof games,
  idField: typeof anime.anilistId | typeof games.steamId,
  body: PinBody
) {
  if (!db) {
    return { success: false, error: "Database is offline. Changes not saved." };
  }
  try {
    if (body.isPinned) {
      const values: any = {
        title: body.title,
        isPinned: true
      };
      if (table === anime) {
        values.anilistId = body.id;
      } else {
        values.steamId = body.id;
      }

      await db.insert(table).values(values).onConflictDoUpdate({
        target: idField,
        set: { isPinned: true }
      });
    } else {
      await db.update(table)
        .set({ isPinned: false })
        .where(eq(idField, body.id));
    }
    return { success: true };
  } catch (e) {
    console.error(`Pin entity error:`, e);
    return { success: false, error: "Database error. Changes not saved." };
  }
}

async function withDb<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  if (!db) return fallback;
  try {
    return await fn();
  } catch (e) {
    console.error("DB Error:", e);
    return fallback;
  }
}

const app = new Elysia()
  // Add API Documentation
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: { title: 'MehmetCanWT API', version: '1.0.0' }
    }
  }))
  .use(cors({
    origin: (request) => {
      const origin = request.headers.get('origin');
      if (!origin) return true;

      // In development, allow localhost and 127.0.0.1
      if (!isProd || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return true;
      }

      // Parse custom origins from environment
      const allowedOrigins = process.env.CORS_ORIGINS 
        ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
        : [];
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return true;
      }

      // Fallback defaults
      const defaultRegex = /^https:\/\/(www\.)?mehmetcanwt\.xyz$/;
      if (defaultRegex.test(origin)) return true;

      // Allow any HTTPS origin dynamically to support custom domains in Nginx Proxy Manager
      if (origin.startsWith('https://')) {
        return true;
      }

      return false;
    },
    credentials: true
  }))
  // Security Headers Middleware
  .onRequest(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff';
    set.headers['X-Frame-Options'] = 'DENY';
    set.headers['X-XSS-Protection'] = '1; mode=block';
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  })
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET_KEY,
      exp: '24h'
    })
  )

  // --- Public routes ---
  .get('/api/anime', async () => {
    const allAnime = await getAllAnime('MehmetCanWT');
    const pinned = await withDb([] as { anilistId: number }[], () =>
      db!.select().from(anime).where(eq(anime.isPinned, true))
    );
    const pinnedIds = pinned.map(p => p.anilistId);
    return { allAnime, pinnedIds };
  })
  .get('/api/games', async () => {
    const allGames = await getAllGames(STEAM_ID);
    const pinned = await withDb([] as { steamId: number }[], () =>
      db!.select().from(games).where(eq(games.isPinned, true))
    );
    const pinnedIds = pinned.map(p => p.steamId);
    return { allGames, pinnedIds };
  })
  .get('/api/news', async () => {
    return await getMixedNews();
  })
  .get('/api/quote', async () => {
    return await getDailyQuote(false);
  })
  .get('/api/guestbook', async () => {
    return await withDb([], () =>
      db!.select().from(guestbook).orderBy(desc(guestbook.createdAt)).limit(50)
    );
  })
  .post('/api/guestbook', async ({ body, request, set }) => {
    const ip = getClientIp(request);
    
    if (!checkRateLimit(ip)) {
      set.status = 429;
      return { error: "Too many requests. Please wait a minute." };
    }

    const username = stripHtml(body.username);
    const message = stripHtml(body.message);
    
    const BANNED_WORDS = ["kill", "death", "suicide", "nazi", "hitler", "racist", "terror", "bomb", "murder", "rape", "pedophile", "die"];
    
    if (!username || !message) {
      set.status = 400;
      return { error: "Username and message are required." };
    }
    if (username.length > 20) {
      set.status = 400;
      return { error: "Username too long." };
    }
    if (message.length > 100) {
      set.status = 400;
      return { error: "Message too long." };
    }
    
    const lowerMessage = message.toLowerCase();
    const isClean = !BANNED_WORDS.some(word => lowerMessage.includes(word));
    if (!isClean) {
      set.status = 400;
      return { error: "Message contains restricted content. Keep it friendly!" };
    }

    return await withDb<{ success: boolean; error?: string }>({ success: false, error: "Database is offline. Changes not saved." }, async () => {
      await db!.insert(guestbook).values({ username, message });
      return { success: true };
    });
  }, {
    body: t.Object({
      username: t.String(),
      message: t.String()
    })
  })

  // --- Auth endpoints ---
  .post('/api/admin/login', async ({ body, jwt, set, cookie: { auth }, request }) => {
    const ip = getClientIp(request);
    
    // Strict rate limit for login: max 5 attempts per 15 minutes
    if (!checkRateLimit(`login_${ip}`, 5, 15 * 60 * 1000)) {
      set.status = 429;
      return { error: "Too many login attempts. Blocked for 15 minutes." };
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      set.status = 500;
      return { error: "Server auth not configured." };
    }

    // Timing-safe comparison using SHA-256 hashing to normalize length
    const hash = (s: string) => createHash('sha256').update(s).digest();
    const providedHash = hash(body.password);
    const expectedHash = hash(adminPassword);

    if (!timingSafeEqual(providedHash, expectedHash)) {
      set.status = 401;
      return { error: "Invalid credentials." };
    }

    const token = await jwt.sign({ role: 'admin' });
    auth.set({
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 86400 // 24 hours
    });

    return { success: true };
  }, {
    body: t.Object({
      password: t.String()
    })
  })
  .post('/api/admin/logout', async ({ cookie: { auth } }) => {
    auth.remove();
    return { success: true };
  })

  // --- Protected admin routes ---
  .guard({
    beforeHandle: async ({ jwt, set, cookie: { auth } }) => {
      const token = auth.value;
      if (!token) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const payload = await jwt.verify(token as string);

      if (!payload || payload.role !== 'admin') {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
  }, (app) => app
    .post('/api/admin/pin-anime', async ({ body }) => {
      return await pinEntity(anime, anime.anilistId, body);
    }, {
      body: t.Object({
        id: t.Number(),
        isPinned: t.Boolean(),
        title: t.String()
      })
    })
    .post('/api/admin/pin-game', async ({ body }) => {
      return await pinEntity(games, games.steamId, body);
    }, {
      body: t.Object({
        id: t.Number(),
        isPinned: t.Boolean(),
        title: t.String()
      })
    })
    .post('/api/admin/guestbook/delete', async ({ body }) => {
      return await withDb<{ success: boolean; error?: string }>({ success: false, error: "Database is offline." }, async () => {
        await db!.delete(guestbook).where(eq(guestbook.id, body.id));
        return { success: true };
      });
    }, {
      body: t.Object({
        id: t.Number()
      })
    })
    .post('/api/admin/quote/force-update', async () => {
      try {
        await getDailyQuote(true);
        return { success: true };
      } catch (e) {
        return { success: false, error: "Update failed." };
      }
    })
  )
  .get('/api/og/readme', async ({ set }) => {
    try {
      const [animes, allGames] = await Promise.all([
        getAllAnime('MehmetCanWT'),
        getAllGames(STEAM_ID)
      ]);

      const favoriteAnime = await getAnimeById(21) || animes[0];
      const topGame = [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];
      const gameImageUrl = topGame ? 'https://cdn.akamai.steamstatic.com/steam/apps/' + topGame.appid + '/header.jpg' : '';

      if (!fontData) return new Response("Font not loaded");

      const svg = await satori(
        React.createElement('div', {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            padding: '30px',
            fontFamily: 'Inter',
          }
        }, [
          React.createElement('div', { key: 'header', style: { display: 'flex', width: '100%', marginBottom: '15px' } }, [
            React.createElement('div', { key: 'header-inner', style: { display: 'flex', backgroundColor: '#000', color: '#fff', padding: '8px 16px', fontSize: '28px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase' } }, 'MEHMETCANWT // LIVE ARCHIVE')
          ]),
          React.createElement('div', { key: 'anime', style: { display: 'flex', width: '100%', backgroundColor: '#fff', border: '4px solid #000', boxShadow: '6px 6px 0px #000', padding: '15px', marginBottom: '20px', alignItems: 'center' } }, [
            React.createElement('div', { key: 'anime-img-box', style: { display: 'flex', width: '80px', height: '110px', border: '2px solid #000', marginRight: '20px', overflow: 'hidden' } }, [
              React.createElement('img', { src: favoriteAnime?.coverImage.large, style: { width: '100%', height: '100%', objectFit: 'cover' } })
            ]),
            React.createElement('div', { key: 'anime-info', style: { display: 'flex', flexDirection: 'column', flex: 1 } }, [
              React.createElement('div', { key: 'anime-label', style: { display: 'flex', backgroundColor: '#000', color: '#fff', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '5px' } }, 'FAVORITE ANIME'),
              React.createElement('div', { key: 'anime-title', style: { display: 'flex', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.1 } }, favoriteAnime?.title.english || favoriteAnime?.title.romaji || 'ONE PIECE'),
              React.createElement('div', { key: 'anime-status', style: { display: 'flex', fontSize: '12px', fontWeight: 'bold', marginTop: '5px', color: '#666' } }, `STATUS: ${favoriteAnime?.status || 'COMPLETED'} // ${favoriteAnime?.averageScore}% SCORE`)
            ])
          ]),
          React.createElement('div', { key: 'game', style: { display: 'flex', width: '100%', backgroundColor: '#fff', border: '4px solid #000', boxShadow: '6px 6px 0px #000', padding: '15px', alignItems: 'center' } }, [
            React.createElement('div', { key: 'game-img-box', style: { display: 'flex', width: '140px', height: '80px', border: '2px solid #000', marginRight: '20px', overflow: 'hidden' } }, [
              React.createElement('img', { src: gameImageUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } })
            ]),
            React.createElement('div', { key: 'game-info', style: { display: 'flex', flexDirection: 'column', flex: 1 } }, [
              React.createElement('div', { key: 'game-label', style: { display: 'flex', backgroundColor: '#000', color: '#fff', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '5px' } }, 'MOST PLAYED MISSION'),
              React.createElement('div', { key: 'game-title', style: { display: 'flex', fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.1 } }, topGame?.name || 'COUNTER-STRIKE 2'),
              React.createElement('div', { key: 'game-time', style: { display: 'flex', fontSize: '12px', fontWeight: 'bold', marginTop: '5px', color: '#666' } }, `TOTAL OPERATION TIME: ${(topGame?.playtime_forever / 60 || 0).toFixed(0)} HOURS`)
            ])
          ]),
          React.createElement('div', { key: 'footer', style: { display: 'flex', marginTop: '15px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.5 } }, 'SYNCED WITH VDS NODE 01 // MEHMETCANWT.XYZ')
        ]),
        {
          width: 800,
          height: 500,
          fonts: [
            {
              name: 'Inter',
              data: fontData,
              weight: 900,
              style: 'normal',
            },
          ],
        }
      );

      const resvg = new Resvg(svg);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();

      set.headers['content-type'] = 'image/png';
      return pngBuffer;
    } catch (e) {
      console.error("OG Generation Error:", e);
      set.headers['content-type'] = 'text/plain';
      return "OG Generation failed. Check logs for details.";
    }
  });

// Production mode: Serve static UI files
if (isProd) {
  const staticPath = path.resolve(__dirname, '../../web/dist');
  app.use(staticPlugin({
    assets: staticPath,
    prefix: '/'
  }));

  // Catch-all for React Router SPA
  app.get('*', () => Bun.file(path.join(staticPath, 'index.html')));
}

app.listen(isProd ? 3000 : 3001);

console.log(`🚀 Elysia is running in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
