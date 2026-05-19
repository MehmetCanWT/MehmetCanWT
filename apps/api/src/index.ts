import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysia/jwt';
import { db, anime, games, guestbook } from 'db';
import { eq, desc } from 'drizzle-orm';
import { getAllAnime, getAnimeById } from './lib/anilist';
import { getAllGames } from './lib/steam';
import { getMixedNews } from './lib/news';
import { getDiscordStatus } from './lib/discord';
import { getDailyQuote } from './lib/quotes';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import React from 'react';
import { timingSafeEqual } from 'crypto';

const isProd = process.env.NODE_ENV === 'production';
const STEAM_ID = process.env.STEAM_ID || '76561198200466026';
const DISCORD_ID = process.env.DISCORD_ID || '736294975760826438';

if (isProd && !process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in production!");
  process.exit(1);
}
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'fallback_dev_secret_change_me';

// Fetch font once on start (Safe fetch)
let fontData: ArrayBuffer;
try {
  fontData = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Black.ttf').then(res => res.arrayBuffer());
} catch (e) {
  console.warn("Could not fetch font for OG image, using fallback logic.");
}

// --- Rate limiter for guestbook ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per minute

function checkRateLimit(ip: string): boolean {
  // Prevent memory leak from unbounded Map size
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear();
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

const app = new Elysia()
  .use(cors({
    origin: isProd ? [/^https:\/\/(www\.)?mehmetcanwt\.xyz$/] : true,
    credentials: true
  }))
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET_KEY,
      exp: '24h'
    })
  )

  // --- Public routes ---
  .get('/api/anime', async () => {
    try {
      const allAnime = await getAllAnime('MehmetCanWT');
      let pinned: any[] = [];
      if (db) {
        pinned = await db.select().from(anime).where(eq(anime.isPinned, true)).catch(() => []);
      }
      const pinnedIds = Array.isArray(pinned) ? pinned.map(p => p.anilistId) : [];
      return { allAnime, pinnedIds };
    } catch (error) {
      console.error("DB Offline, returning mock/public data only.");
      const allAnime = await getAllAnime('MehmetCanWT');
      return { allAnime, pinnedIds: [] };
    }
  })
  .get('/api/games', async () => {
    try {
      const allGames = await getAllGames(STEAM_ID);
      let pinned: any[] = [];
      if (db) {
        pinned = await db.select().from(games).where(eq(games.isPinned, true)).catch(() => []);
      }
      const pinnedIds = Array.isArray(pinned) ? pinned.map(p => p.steamId) : [];
      return { allGames, pinnedIds };
    } catch (error) {
      console.error("DB Offline, returning mock/public data only.");
      const allGames = await getAllGames(STEAM_ID);
      return { allGames, pinnedIds: [] };
    }
  })
  .get('/api/news', async () => {
    return await getMixedNews();
  })
  .get('/api/discord', async () => {
    return await getDiscordStatus(DISCORD_ID);
  })
  .get('/api/quote', async () => {
    return await getDailyQuote(false);
  })
  .get('/api/guestbook', async () => {
    try {
      if (db) {
        return await db.select().from(guestbook).orderBy(desc(guestbook.createdAt)).limit(50);
      }
      return [];
    } catch (e) {
      console.error("DB Offline - cannot fetch guestbook");
      return [];
    }
  })
  .post('/api/guestbook', async ({ body, request, set }) => {
    // Rate limit check with IP spoofing protection (taking the first client IP)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || 'unknown');
    
    if (!checkRateLimit(ip)) {
      set.status = 429;
      return { error: "Too many requests. Please wait a minute." };
    }

    const { username, message } = body;
    const BANNED_WORDS = ["kill", "death", "suicide", "nazi", "hitler", "racist", "terror", "bomb", "murder", "rape", "pedophile", "die"];
    
    if (!username || !message) return { error: "Username and message are required." };
    if (username.length > 20) return { error: "Username too long." };
    if (message.length > 100) return { error: "Message too long." };
    
    const lowerMessage = message.toLowerCase();
    const isClean = !BANNED_WORDS.some(word => lowerMessage.includes(word));
    if (!isClean) return { error: "Message contains restricted content. Keep it friendly!" };

    try {
      if (db) {
        await db.insert(guestbook).values({ username, message });
        return { success: true };
      }
      return { error: "Database is offline. Changes not saved." };
    } catch (e) {
      return { error: "Database is offline. Changes not saved." };
    }
  }, {
    body: t.Object({
      username: t.String(),
      message: t.String()
    })
  })

  // --- Auth endpoint ---
  .post('/api/admin/login', async ({ body, jwt, set }) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      set.status = 500;
      return { error: "Server auth not configured." };
    }

    // Protect against timing attacks
    const providedBuf = Buffer.from(body.password);
    const expectedBuf = Buffer.from(adminPassword);

    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
      set.status = 401;
      return { error: "Invalid credentials." };
    }

    const token = await jwt.sign({ role: 'admin' });
    return { success: true, token };
  }, {
    body: t.Object({
      password: t.String()
    })
  })

  // --- Protected admin routes ---
  .guard({
    beforeHandle: async ({ jwt, set, request }) => {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = await jwt.verify(token);

      if (!payload || payload.role !== 'admin') {
        set.status = 401;
        return { error: "Unauthorized" };
      }
    }
  }, (app) => app
    .post('/api/admin/pin-anime', async ({ body }) => {
      const { id, isPinned, title } = body;
      try {
        if (db) {
          if (isPinned) {
            await db.insert(anime).values({
              anilistId: id,
              title: title,
              isPinned: true
            }).onConflictDoUpdate({
              target: anime.anilistId,
              set: { isPinned: true }
            });
          } else {
            await db.update(anime)
              .set({ isPinned: false })
              .where(eq(anime.anilistId, id));
          }
          return { success: true };
        }
        return { success: false, error: "Database is offline. Changes not saved." };
      } catch (e) {
        return { success: false, error: "Database is offline. Changes not saved." };
      }
    }, {
      body: t.Object({
        id: t.Number(),
        isPinned: t.Boolean(),
        title: t.String()
      })
    })
    .post('/api/admin/pin-game', async ({ body }) => {
      const { id, isPinned, title } = body;
      try {
        if (db) {
          if (isPinned) {
            await db.insert(games).values({
              steamId: id,
              title: title,
              isPinned: true
            }).onConflictDoUpdate({
              target: games.steamId,
              set: { isPinned: true }
            });
          } else {
            await db.update(games)
              .set({ isPinned: false })
              .where(eq(games.steamId, id));
          }
          return { success: true };
        }
        return { success: false, error: "Database is offline. Changes not saved." };
      } catch (e) {
        return { success: false, error: "Database is offline. Changes not saved." };
      }
    }, {
      body: t.Object({
        id: t.Number(),
        isPinned: t.Boolean(),
        title: t.String()
      })
    })
    .post('/api/admin/guestbook/delete', async ({ body }) => {
      const { id } = body;
      try {
        if (db) {
          await db.delete(guestbook).where(eq(guestbook.id, id));
          return { success: true };
        }
        return { success: false, error: "Database is offline. Changes not saved." };
      } catch (e) {
        return { success: false, error: "Database is offline. Changes not saved." };
      }
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
      set.headers['content-type'] = 'text/plain';
      return "OG Generation failed - likely DB offline";
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
