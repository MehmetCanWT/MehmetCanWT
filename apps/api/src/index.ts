import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
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

const isProd = process.env.NODE_ENV === 'production';

// Fetch font once on start (Safe fetch)
let fontData: ArrayBuffer;
try {
  fontData = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Black.ttf').then(res => res.arrayBuffer());
} catch (e) {
  console.warn("Could not fetch font for OG image, using fallback logic.");
}

const app = new Elysia()
  .use(cors({
    origin: isProd ? 'mehmetcanwt.xyz' : true,
    credentials: true
  }))
  .get('/api/anime', async () => {
    try {
      const [allAnime, pinned] = await Promise.all([
        getAllAnime('MehmetCanWT'),
        db.select().from(anime).where(eq(anime.isPinned, true)).catch(() => [])
      ]);
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
      const [allGames, pinned] = await Promise.all([
        getAllGames('76561198200466026'),
        db.select().from(games).where(eq(games.isPinned, true)).catch(() => [])
      ]);
      const pinnedIds = Array.isArray(pinned) ? pinned.map(p => p.steamId) : [];
      return { allGames, pinnedIds };
    } catch (error) {
      console.error("DB Offline, returning mock/public data only.");
      const allGames = await getAllGames('76561198200466026');
      return { allGames, pinnedIds: [] };
    }
  })
  .get('/api/news', async () => {
    return await getMixedNews();
  })
  .get('/api/discord', async () => {
    return await getDiscordStatus('736294975760826438'); // You will need to replace this with your actual discord user ID if it's different.
  })
  .get('/api/quote', async () => {
    return await getDailyQuote(false);
  })
  .get('/api/guestbook', async () => {
    try {
      return await db.select().from(guestbook).orderBy(desc(guestbook.createdAt)).limit(50);
    } catch (e) {
      console.error("DB Offline - cannot fetch guestbook");
      return [];
    }
  })
  .post('/api/guestbook', async ({ body }) => {
    const { username, message } = body;
    const BANNED_WORDS = ["kill", "death", "suicide", "nazi", "hitler", "racist", "terror", "bomb", "murder", "rape", "pedophile", "die"];
    
    if (!username || !message) return { error: "Username and message are required." };
    if (username.length > 20) return { error: "Username too long." };
    if (message.length > 100) return { error: "Message too long." };
    
    const lowerMessage = message.toLowerCase();
    const isClean = !BANNED_WORDS.some(word => lowerMessage.includes(word));
    if (!isClean) return { error: "Message contains restricted content. Keep it friendly!" };

    try {
      await db.insert(guestbook).values({ username, message });
      return { success: true };
    } catch (e) {
      return { error: "Database is offline. Changes not saved." };
    }
  }, {
    body: t.Object({
      username: t.String(),
      message: t.String()
    })
  })
  .post('/api/admin/pin-anime', async ({ body }) => {
    const { id, isPinned, title } = body;
    try {
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
      await db.delete(guestbook).where(eq(guestbook.id, id));
      return { success: true };
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
  .get('/api/og/readme', async ({ set }) => {
    try {
      const [animes, allGames] = await Promise.all([
        getAllAnime('MehmetCanWT'),
        getAllGames('76561198200466026')
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
