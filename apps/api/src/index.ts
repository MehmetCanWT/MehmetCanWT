import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { jwt } from '@elysia/jwt';
import { swagger } from '@elysiajs/swagger';
import { db, anime, games, guestbook } from 'db';
import { eq, desc } from 'drizzle-orm';
import { getAllAnime } from './lib/anilist';
import { getAllGames } from './lib/steam';
import { getMixedNews } from './lib/news';
import { getDailyQuote } from './lib/quotes';
import { invalidateAllCache } from './lib/cache';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import React from 'react';
import { createHash, timingSafeEqual } from 'crypto';

const isProd = process.env.NODE_ENV === 'production';
const STEAM_ID = process.env.STEAM_ID || '';

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
  const res = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-900-normal.ttf');
  if (!res.ok) {
    throw new Error(`Failed to fetch font: ${res.status} ${res.statusText}`);
  }
  fontData = await res.arrayBuffer();
} catch (e) {
  console.warn("Could not fetch font for OG image, using fallback logic:", e);
}

async function fetchImageAsBase64(url: string): Promise<string> {
  if (!url) return '';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/'
      }
    });
    if (!res.ok) return '';
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${Buffer.from(buf).toString('base64')}`;
  } catch (e) {
    return '';
  }
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
    const values: any = {
      title: body.title,
      isPinned: body.isPinned
    };
    if (table === anime) {
      values.anilistId = body.id;
    } else {
      values.steamId = body.id;
    }

    await db.insert(table).values(values).onConflictDoUpdate({
      target: idField,
      set: { isPinned: body.isPinned }
    });
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
    const pinnedIds = pinned.length > 0 ? pinned.map(p => p.anilistId) : [21];
    return { allAnime, pinnedIds };
  })
  .get('/api/games', async () => {
    const allGames = await getAllGames(STEAM_ID);
    const pinned = await withDb([] as { steamId: number }[], () =>
      db!.select().from(games).where(eq(games.isPinned, true))
    );
    const pinnedIds = pinned.length > 0 ? pinned.map(p => p.steamId) : [346110, 730];
    const profile = {
      steamid: STEAM_ID,
      personaname: "FemboyMemo",
      avatar: "https://shared.akamai.steamstatic.com/community_assets/images/items/1385730/b2bba5dcd8e2942ec5ba7639ea6622753e6005ad.gif",
      avatarframe: "https://shared.fastly.steamstatic.com/community_assets/images/items/527230/18ec71cb7da1182d32164890bac8411a09e26e46.png",
      level: 54,
      totalHours: 8901,
      backgroundVideoWebm: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/7890df00a25ba9bbb8947df4205e04c88006852b.webm",
      backgroundVideoMp4: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/8225c97a6365c6fefdd41afc76012c1e117fa3a2.mp4",
      backgroundPoster: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/468af81383083392a90b6434813cbd741c3da7cf.jpg",
      lastUpdated: new Date().toISOString(),
    };
    return { profile, allGames, pinnedIds };
  })
  .get('/api/lanyard', async () => {
    const discordId = process.env.DISCORD_ID;
    if (!discordId) return { error: 'DISCORD_ID not configured' };
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
      if (res.ok) {
        const data = await res.json();
        return { ...data, discord_id: discordId };
      }
    } catch (e) {
      console.error('Lanyard fetch error:', e);
    }
    return { error: 'Failed to fetch Lanyard data' };
  })
  .get('/api/discord', async () => {
    const discordId = process.env.DISCORD_ID;
    if (!discordId) return { error: 'DISCORD_ID not configured' };
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
      if (res.ok) {
        const data = await res.json();
        return { ...data, discord_id: discordId };
      }
    } catch (e) {
      console.error('Lanyard fetch error:', e);
    }
    return { error: 'Failed to fetch Lanyard data' };
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

    return { success: true, token };
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
    beforeHandle: async ({ jwt, set, cookie: { auth }, request }) => {
      const authHeader = request ? request.headers.get('Authorization') : null;
      const token = auth.value || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);
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
    .post('/api/admin/fresh-data', async () => {
      try {
        await invalidateAllCache();
        const [animes, allGames, quote] = await Promise.all([
          getAllAnime('MehmetCanWT'),
          getAllGames(STEAM_ID),
          getDailyQuote(true),
        ]);
        return {
          success: true,
          message: "Cache cleared and live data refreshed.",
          summary: {
            animeCount: animes.length,
            gamesCount: allGames.length,
            quoteCharacter: quote.character,
          },
        };
      } catch (e) {
        return { success: false, error: "Fresh data refresh failed." };
      }
    })
  )
  .get('/api/og/readme', async ({ set }) => {
    try {
      const [animes, allGames] = await Promise.all([
        getAllAnime('MehmetCanWT'),
        getAllGames(STEAM_ID)
      ]);

      const pinned = await withDb([] as { anilistId: number }[], () =>
        db!.select().from(anime).where(eq(anime.isPinned, true))
      );
      const pinnedAnimeId = pinned[0]?.anilistId || 21;
      const favoriteAnime = animes.find(a => a.id === pinnedAnimeId) || animes[0];

      const pinnedG = await withDb([] as { steamId: number }[], () =>
        db!.select().from(games).where(eq(games.isPinned, true))
      );
      const pinnedGameId = pinnedG[0]?.steamId || 346110;
      const topGame = allGames.find(g => g.appid === pinnedGameId) || [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];

      const rawGameUrl = topGame ? `https://cdn.akamai.steamstatic.com/steam/apps/${topGame.appid}/header.jpg` : '';
      const rawAnimeUrl = favoriteAnime?.coverImage?.large || '';

      // Convert images to base64 so Satori / GitHub embeds them natively with 0 broken images
      const [animeBase64, gameBase64] = await Promise.all([
        fetchImageAsBase64(rawAnimeUrl),
        fetchImageAsBase64(rawGameUrl)
      ]);

      if (!fontData) return new Response("Font not loaded");

      const hours = Math.round((topGame?.playtime_forever || 0) / 60);

      const svg = await satori(
        React.createElement('div', {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0c0a0f',
            backgroundImage: 'radial-gradient(circle, #26172a 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
            padding: '24px 30px',
            fontFamily: 'Inter',
            border: '4px solid #3b1828',
            borderRadius: '16px',
            boxSizing: 'border-box',
          }
        }, [
          // Top Bar
          React.createElement('div', {
            key: 'header',
            style: {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid rgba(255,255,255,0.1)',
              paddingBottom: '12px',
              marginBottom: '14px',
            }
          }, [
            React.createElement('div', {
              key: 'header-title',
              style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1a0c14',
                color: '#ffffff',
                border: '2px solid #e11d48',
                padding: '6px 14px',
                fontSize: '20px',
                fontWeight: 900,
                fontStyle: 'italic',
                textTransform: 'uppercase',
                letterSpacing: '-0.5px',
              }
            }, 'MEHMETCANWT // LIVE ARCHIVE'),
            React.createElement('div', {
              key: 'header-status',
              style: {
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#052e16',
                color: '#4ade80',
                border: '1.5px solid #16a34a',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '1px',
                borderRadius: '4px',
              }
            }, '● ONLINE')
          ]),

          // Main 2-column cards layout
          React.createElement('div', {
            key: 'cards-row',
            style: {
              display: 'flex',
              width: '100%',
              gap: '16px',
              flex: 1,
            }
          }, [
            // Left Card: Favorite Anime
            React.createElement('div', {
              key: 'anime-card',
              style: {
                display: 'flex',
                flex: 1,
                backgroundColor: '#160c13',
                border: '2px solid #e11d48',
                boxShadow: '4px 4px 0px #e11d48',
                borderRadius: '10px',
                padding: '14px',
                alignItems: 'center',
                gap: '14px',
              }
            }, [
              animeBase64 ? React.createElement('img', {
                key: 'anime-img',
                src: animeBase64,
                style: {
                  width: '90px',
                  height: '120px',
                  borderRadius: '6px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  objectFit: 'cover',
                }
              }) : null,
              React.createElement('div', {
                key: 'anime-info',
                style: { display: 'flex', flexDirection: 'column', flex: 1 }
              }, [
                React.createElement('div', {
                  key: 'anime-badge',
                  style: {
                    display: 'flex',
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    alignSelf: 'flex-start',
                    marginBottom: '6px',
                    borderRadius: '2px',
                  }
                }, 'TOP PICK // FAVORITE ANIME'),
                React.createElement('div', {
                  key: 'anime-title',
                  style: {
                    display: 'flex',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    lineHeight: 1.1,
                    marginBottom: '6px',
                  }
                }, favoriteAnime?.title?.english || favoriteAnime?.title?.romaji || 'ONE PIECE'),
                React.createElement('div', {
                  key: 'anime-score',
                  style: {
                    display: 'flex',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#fb7185',
                    marginBottom: '4px',
                  }
                }, '★ 5/5 STARS // STATUS: CURRENT'),
                React.createElement('div', {
                  key: 'anime-progress',
                  style: {
                    display: 'flex',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#facc15',
                  }
                }, `${favoriteAnime?.progress || 1180}+ EPISODES LOGGED`)
              ])
            ]),

            // Right Card: Top Mission
            React.createElement('div', {
              key: 'game-card',
              style: {
                display: 'flex',
                flex: 1,
                backgroundColor: '#171109',
                border: '2px solid #f59e0b',
                boxShadow: '4px 4px 0px #f59e0b',
                borderRadius: '10px',
                padding: '14px',
                alignItems: 'center',
                gap: '14px',
              }
            }, [
              gameBase64 ? React.createElement('img', {
                key: 'game-img',
                src: gameBase64,
                style: {
                  width: '120px',
                  height: '75px',
                  borderRadius: '6px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  objectFit: 'cover',
                }
              }) : null,
              React.createElement('div', {
                key: 'game-info',
                style: { display: 'flex', flexDirection: 'column', flex: 1 }
              }, [
                React.createElement('div', {
                  key: 'game-badge',
                  style: {
                    display: 'flex',
                    backgroundColor: '#f59e0b',
                    color: '#000000',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    alignSelf: 'flex-start',
                    marginBottom: '6px',
                    borderRadius: '2px',
                  }
                }, 'TOP MISSION // MASTERED'),
                React.createElement('div', {
                  key: 'game-title',
                  style: {
                    display: 'flex',
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    lineHeight: 1.1,
                    marginBottom: '6px',
                  }
                }, topGame?.name || 'ARK: SURVIVAL EVOLVED'),
                React.createElement('div', {
                  key: 'game-time',
                  style: {
                    display: 'flex',
                    fontSize: '14px',
                    fontWeight: 900,
                    color: '#fde047',
                    marginBottom: '4px',
                  }
                }, `${hours.toLocaleString()} HOURS RECORDED`),
                React.createElement('div', {
                  key: 'game-status',
                  style: {
                    display: 'flex',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#34d399',
                  }
                }, 'VERIFIED MISSION RECORD')
              ])
            ])
          ]),

          // Bottom Bar
          React.createElement('div', {
            key: 'footer',
            style: {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid rgba(255,255,255,0.1)',
              paddingTop: '10px',
              marginTop: '14px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.5px',
            }
          }, [
            React.createElement('span', { key: 'foot-left', style: { display: 'flex', color: '#38bdf8' } }, 'SYNCED WITH MEHMETCANWT.XYZ'),
            React.createElement('span', { key: 'foot-right', style: { display: 'flex', color: '#a855f7' } }, 'LEVEL 22 HUMAN // ARCHIVE NODE 01')
          ])
        ]),
        {
          width: 860,
          height: 320,
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
      set.headers['cache-control'] = 'public, max-age=1800, s-maxage=1800';
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
