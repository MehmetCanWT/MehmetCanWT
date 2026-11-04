import type { Config, Context } from "@netlify/functions";

// --- Types ---
interface AnimeEntry {
  id: number;
  title: {
    english: string;
    romaji: string;
  };
  coverImage: {
    large: string;
  };
  status: string;
  averageScore: number;
  userScore: number;
  progress: number;
  description?: string;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

interface NewsItem {
  title: string;
  source: string;
}

interface QuoteData {
  quote: string;
  character: string;
  anime: string;
  characterImage?: string;
  animeImage?: string;
  isFallback?: boolean;
}

interface GuestbookEntry {
  id: number;
  username: string;
  message: string;
  createdAt: string;
}

// In-memory guestbook fallback
const memoryGuestbook: GuestbookEntry[] = [
  {
    id: 1,
    username: "SYSTEM",
    message: "ARCHIVE NODE OPERATIONAL // ALL SYSTEMS NORMAL",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: "MehmetCanWT",
    message: "Welcome to my digital terminal & live archive. Feel free to leave a log!",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Fallback anime quotes
const FALLBACK_QUOTES: QuoteData[] = [
  {
    quote: "Believe in the me that believes in you!",
    character: "Kamina",
    anime: "Gurren Lagann",
    characterImage:
      "https://s4.anilist.co/file/anilistcdn/character/large/b2075-sWb5Xz76JWdX.png",
    animeImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx2001-XwRnjzGeFWRQ.png",
    isFallback: true,
  },
  {
    quote:
      "I am the hope of the universe. I am the answer to all living things that cry out for peace.",
    character: "Goku",
    anime: "Dragon Ball Z",
    characterImage:
      "https://s4.anilist.co/file/anilistcdn/character/large/246-wsRRr6z1kii8.png",
    animeImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png",
    isFallback: true,
  },
  {
    quote: "If you don't take risks, you can't create a future.",
    character: "Monkey D. Luffy",
    anime: "One Piece",
    characterImage:
      "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png",
    animeImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg",
    isFallback: true,
  },
];

// Fallback popular games
const FALLBACK_GAMES: SteamGame[] = [
  {
    appid: 730,
    name: "Counter-Strike 2",
    playtime_forever: 14280,
    img_icon_url: "d0595ff02f5c79e6027c02b9e4a8b75960010078",
  },
  {
    appid: 413150,
    name: "Stardew Valley",
    playtime_forever: 8400,
    img_icon_url: "075fb88950c40625345719e73d3a0179a613cfcf",
  },
  {
    appid: 252490,
    name: "Rust",
    playtime_forever: 5600,
    img_icon_url: "a80c8680fa2a91216503c05943b5937409f58330",
  },
  {
    appid: 1245620,
    name: "ELDEN RING",
    playtime_forever: 7200,
    img_icon_url: "17b8b209a7d96eb9729a6b0c2a233b860fb7f8a7",
  },
];

// --- AniList Fetcher ---
async function fetchAniList(userName: string = "MehmetCanWT"): Promise<AnimeEntry[]> {
  const query = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          name
          entries {
            media {
              id
              title { english romaji }
              coverImage { large }
              averageScore
              description(asHtml: false)
            }
            status
            progress
            score(format: POINT_100)
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { userName } }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const lists = data?.data?.MediaListCollection?.lists || [];
    const entries: AnimeEntry[] = [];

    lists.forEach((list: any) => {
      list.entries?.forEach((e: any) => {
        if (!e?.media) return;
        entries.push({
          id: e.media.id,
          title: e.media.title,
          coverImage: e.media.coverImage,
          status: e.status,
          averageScore: e.media.averageScore,
          userScore: e.score || 0,
          progress: e.progress,
          description: e.media.description,
        });
      });
    });

    const statusOrder: Record<string, number> = {
      CURRENT: 0,
      REPEATING: 0,
      COMPLETED: 1,
      PAUSED: 2,
      DROPPED: 3,
      PLANNING: 4,
    };

    return entries.sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (b.userScore || 0) - (a.userScore || 0);
    });
  } catch (e) {
    console.error("AniList fetch error:", e);
    return [];
  }
}

// --- Steam Fetcher ---
async function fetchSteamGames(steamId: string, webKey?: string): Promise<SteamGame[]> {
  if (!webKey) return FALLBACK_GAMES;

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${webKey}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`;
    const res = await fetch(url);
    if (!res.ok) return FALLBACK_GAMES;

    const data = await res.json();
    const games = data?.response?.games;
    if (!Array.isArray(games) || games.length === 0) return FALLBACK_GAMES;

    return games.map((g: any) => ({
      appid: g.appid,
      name: g.name,
      playtime_forever: g.playtime_forever || 0,
      img_icon_url: g.img_icon_url || "",
    }));
  } catch (e) {
    console.error("Steam fetch error:", e);
    return FALLBACK_GAMES;
  }
}

// --- News Fetcher ---
async function fetchNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch("https://api.jikan.moe/v4/seasons/now");
    const animeNews: NewsItem[] = [];

    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data.slice(0, 5) : [];
      list.forEach((item: any) => {
        if (item?.title) {
          animeNews.push({
            title: `SEASON ANIME: ${item.title.toUpperCase()} AIRING NOW`,
            source: "Jikan",
          });
        }
      });
    }

    const gamingNews: NewsItem[] = [
      { title: "GTA VI OFFICIAL TRAILER & ENGINE SHOWCASE", source: "Gaming" },
      { title: "STEAM SALE 2026 IS LIVE WORLDWIDE", source: "Steam" },
      { title: "ELDEN RING NIGHTREIGN EXPANSION ANNOUNCED", source: "FromSoft" },
      { title: "NINTENDO SWITCH 2 RECORD SALES TOPPING CHARTS", source: "Gaming" },
    ];

    const mixed = [...animeNews, ...gamingNews].sort(() => Math.random() - 0.5);
    return mixed.length > 0
      ? mixed
      : [{ title: "SYSTEM OPERATIONAL // ARCHIVE READY", source: "System" }];
  } catch (e) {
    return [
      { title: "SYSTEM OPERATIONAL // MEHMETCANWT ARCHIVE ONLINE", source: "System" },
      { title: "DISCORD & STEAM SYNCED SUCCESSFULLY", source: "Telemetry" },
    ];
  }
}

// --- Quote Fetcher ---
async function fetchDailyQuote(): Promise<QuoteData> {
  try {
    const res = await fetch("https://yurippe.vercel.app/api/quotes?random=1");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].quote) {
        const item = data[0];
        return {
          quote: item.quote,
          character: item.character || "Anime Character",
          anime: item.show || "Anime",
          isFallback: false,
        };
      }
    }
  } catch (e) {
    console.error("Daily quote fetch error:", e);
  }

  // Fallback quote
  return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

// --- JSON Response Helper ---
function json(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// --- Main Handler ---
export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/\.netlify\/functions\/api/, "/api");

  // Route: /api/anime
  if (pathname === "/api/anime" || pathname.startsWith("/api/anime/")) {
    const allAnime = await fetchAniList("MehmetCanWT");
    return json({
      allAnime,
      pinnedIds: [21], // One Piece pinned
    });
  }

  // Route: /api/games
  if (pathname === "/api/games" || pathname.startsWith("/api/games/")) {
    const steamId = process.env.STEAM_ID || "76561198200466026";
    const webKey = process.env.WEB_KEY || "";
    const allGames = await fetchSteamGames(steamId, webKey);
    return json({
      allGames,
      pinnedIds: [730], // Counter-Strike 2 pinned
    });
  }

  // Route: /api/news
  if (pathname === "/api/news" || pathname.startsWith("/api/news/")) {
    const news = await fetchNews();
    return json(news);
  }

  // Route: /api/quote
  if (pathname === "/api/quote" || pathname.startsWith("/api/quote/")) {
    const quote = await fetchDailyQuote();
    return json(quote);
  }

  // Route: /api/guestbook
  if (pathname === "/api/guestbook" || pathname.startsWith("/api/guestbook/")) {
    if (req.method === "POST") {
      try {
        const body = (await req.json()) as any;
        const username = (body?.username || "Anonymous").trim().slice(0, 30);
        const message = (body?.message || "").trim().slice(0, 200);

        if (!message) {
          return json({ error: "Message cannot be empty." }, 400);
        }

        const newEntry: GuestbookEntry = {
          id: Date.now(),
          username,
          message,
          createdAt: new Date().toISOString(),
        };

        memoryGuestbook.unshift(newEntry);
        return json({ success: true, entry: newEntry });
      } catch (e) {
        return json({ error: "Invalid JSON body." }, 400);
      }
    }

    // GET
    return json(memoryGuestbook);
  }

  // Route: /api/og/readme
  if (pathname === "/api/og/readme") {
    // Generate simple SVG banner for GitHub README
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200">
        <rect width="800" height="200" fill="#000" rx="12"/>
        <text x="40" y="70" fill="#fff" font-family="monospace" font-size="28" font-weight="900" font-style="italic">MEHMETCANWT // LIVE ARCHIVE</text>
        <text x="40" y="115" fill="#f43f5e" font-family="monospace" font-size="14" font-weight="bold">● FULLSTACK MONOREPO // NETLIFY + REACT 19</text>
        <text x="40" y="150" fill="#a1a1aa" font-family="monospace" font-size="13">Anime: One Piece · Gaming: CS2 · Status: Operational</text>
      </svg>
    `.trim();

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // Fallback for unmatched /api routes
  return json({ message: "MehmetCanWT Netlify API operational", path: pathname });
};

export const config: Config = {
  path: "/api/*",
};
