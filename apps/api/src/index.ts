import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { staticPlugin } from '@elysiajs/static';
import { db, anime, games } from 'db';
import { eq } from 'drizzle-orm';
import { getAllAnime, getAnimeById } from './lib/anilist';
import { getAllGames } from './lib/steam';
import { getMixedNews } from './lib/news';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const app = new Elysia()
  .use(cors({
    origin: isProd ? 'mehmetcanwt.xyz' : true,
    credentials: true
  }))
  .get('/api/anime', async () => {
    const [allAnime, pinned] = await Promise.all([
      getAllAnime('MehmetCanWT'),
      db.select().from(anime).where(eq(anime.isPinned, true))
    ]);
    const pinnedIds = pinned.map(p => p.anilistId);
    return { allAnime, pinnedIds };
  })
  .get('/api/games', async () => {
    const [allGames, pinned] = await Promise.all([
      getAllGames('76561198200466026'),
      db.select().from(games).where(eq(games.isPinned, true))
    ]);
    const pinnedIds = pinned.map(p => p.steamId);
    return { allGames, pinnedIds };
  })
  .get('/api/news', async () => {
    return await getMixedNews();
  })
  .post('/api/admin/pin-anime', async ({ body }) => {
    const { id, isPinned, title } = body;
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
  }, {
    body: t.Object({
      id: t.Number(),
      isPinned: t.Boolean(),
      title: t.String()
    })
  })
  .post('/api/admin/pin-game', async ({ body }) => {
    const { id, isPinned, title } = body;
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
  }, {
    body: t.Object({
      id: t.Number(),
      isPinned: t.Boolean(),
      title: t.String()
    })
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

console.log(\🚀 Elysia is running in \ mode at \:\\);

export type App = typeof app;
