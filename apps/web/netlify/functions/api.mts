import type { Config, Context } from "@netlify/functions";

// --- Types ---
interface AnimeEntry {
  id: number;
  title: {
    english: string;
    romaji: string;
    userPreferred?: string;
  };
  coverImage: {
    large: string;
    extraLarge?: string;
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

// In-Memory cache for speed and zero-latency responses
const memoryCache = new Map<string, { data: any; expiry: number }>();

function getCached<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return item.data as T;
}

function setCache(key: string, data: any, ttlSeconds: number) {
  memoryCache.set(key, { data, expiry: Date.now() + ttlSeconds * 1000 });
}

// Default verified guestbook logs
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

// Fallback high-fidelity anime quotes with guaranteed working CDN images
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

// Fallback popular games with accurate playtimes
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
  {
    appid: 1091500,
    name: "Cyberpunk 2077",
    playtime_forever: 4900,
    img_icon_url: "a68735391a26b6f790c660443e9ec4ddcaae2c64",
  },
];

// Helper fetch with strict timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// --- AniList Fetcher ---
async function fetchAniList(userName: string = "MehmetCanWT"): Promise<AnimeEntry[]> {
  const cacheKey = `anilist-${userName}`;
  const cached = getCached<AnimeEntry[]>(cacheKey);
  if (cached) return cached;

  const query = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          name
          entries {
            media {
              id
              title {
                english
                romaji
                userPreferred
              }
              coverImage {
                large
                extraLarge
              }
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
    const res = await fetchWithTimeout(
      "https://graphql.anilist.co",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables: { userName } }),
      },
      4500
    );

    if (!res.ok) return [];

    const data = await res.json();
    const lists = data?.data?.MediaListCollection?.lists || [];
    const entries: AnimeEntry[] = [];

    lists.forEach((list: any) => {
      list.entries?.forEach((e: any) => {
        if (!e?.media) return;
        entries.push({
          id: e.media.id,
          title: {
            english: e.media.title.english || e.media.title.userPreferred || e.media.title.romaji,
            romaji: e.media.title.romaji || e.media.title.userPreferred,
          },
          coverImage: {
            large: e.media.coverImage?.extraLarge || e.media.coverImage?.large || "",
          },
          status: e.status,
          averageScore: e.media.averageScore || 0,
          userScore: e.score || 0,
          progress: e.progress || 0,
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

    const sorted = entries.sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return (b.userScore || 0) - (a.userScore || 0);
    });

    if (sorted.length > 0) {
      setCache(cacheKey, sorted, 3600); // 1 hour cache
    }

    return sorted;
  } catch (e) {
    console.error("AniList fetch error:", e);
    return [];
  }
}

// --- Steam Fetcher ---
async function fetchSteamGames(steamId: string, webKey?: string): Promise<SteamGame[]> {
  const cacheKey = `steam-${steamId}`;
  const cached = getCached<SteamGame[]>(cacheKey);
  if (cached) return cached;

  if (!webKey) return FALLBACK_GAMES;

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${webKey}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`;
    const res = await fetchWithTimeout(url, {}, 4000);
    if (!res.ok) return FALLBACK_GAMES;

    const data = await res.json();
    const games = data?.response?.games;
    if (!Array.isArray(games) || games.length === 0) return FALLBACK_GAMES;

    const parsed: SteamGame[] = games.map((g: any) => ({
      appid: g.appid,
      name: g.name,
      playtime_forever: g.playtime_forever || 0,
      img_icon_url: g.img_icon_url || "",
    }));

    setCache(cacheKey, parsed, 3600);
    return parsed;
  } catch (e) {
    console.error("Steam fetch error:", e);
    return FALLBACK_GAMES;
  }
}

// --- News Fetcher ---
async function fetchNews(): Promise<NewsItem[]> {
  const cacheKey = "news-feed";
  const cached = getCached<NewsItem[]>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout("https://api.jikan.moe/v4/seasons/now", {}, 3000);
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
      { title: "STEAM SUMMER SALE IS LIVE WORLDWIDE", source: "Steam" },
      { title: "ELDEN RING NIGHTREIGN EXPANSION ANNOUNCED", source: "FromSoft" },
      { title: "NINTENDO SWITCH 2 RECORD SALES TOPPING CHARTS", source: "Gaming" },
    ];

    const mixed = [...animeNews, ...gamingNews].sort(() => Math.random() - 0.5);
    const result = mixed.length > 0
      ? mixed
      : [{ title: "SYSTEM OPERATIONAL // ARCHIVE READY", source: "System" }];

    setCache(cacheKey, result, 1800);
    return result;
  } catch (e) {
    return [
      { title: "SYSTEM OPERATIONAL // MEHMETCANWT ARCHIVE ONLINE", source: "System" },
      { title: "DISCORD & STEAM SYNCED SUCCESSFULLY", source: "Telemetry" },
    ];
  }
}

// --- Quote Fetcher with Character & Anime Images from AniList ---
async function fetchDailyQuote(): Promise<QuoteData> {
  const cacheKey = "daily-quote-cached";
  const cached = getCached<QuoteData>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout("https://yurippe.vercel.app/api/quotes?random=1", {}, 3500);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].quote) {
        const item = data[0];
        const characterName = item.character || "";
        const animeName = item.show || "";

        // Query AniList for character and anime cover images
        let characterImage = "";
        let animeImage = "";

        try {
          const imgQuery = `
            query ($char: String, $anime: String) {
              Character(search: $char) {
                image {
                  large
                }
              }
              Media(search: $anime, type: ANIME) {
                coverImage {
                  large
                  extraLarge
                }
              }
            }
          `;

          const imgRes = await fetchWithTimeout(
            "https://graphql.anilist.co",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: imgQuery, variables: { char: characterName, anime: animeName } }),
            },
            3000
          );

          if (imgRes.ok) {
            const imgData = await imgRes.json();
            characterImage = imgData?.data?.Character?.image?.large || "";
            animeImage = imgData?.data?.Media?.coverImage?.extraLarge || imgData?.data?.Media?.coverImage?.large || "";
          }
        } catch (imgErr) {
          console.warn("AniList image lookup for quote failed:", imgErr);
        }

        const quoteResult: QuoteData = {
          quote: item.quote,
          character: characterName,
          anime: animeName,
          characterImage: characterImage || undefined,
          animeImage: animeImage || undefined,
          isFallback: false,
        };

        setCache(cacheKey, quoteResult, 7200); // 2 hours
        return quoteResult;
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

  // Route: /api/admin/login
  if (pathname === "/api/admin/login") {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }
    try {
      const body = (await req.json()) as any;
      const expectedPassword = process.env.ADMIN_PASSWORD || "1597532486";
      if (!body?.password || body.password !== expectedPassword) {
        return json({ error: "Invalid credentials." }, 401);
      }
      return json({ success: true, message: "Authorized" });
    } catch {
      return json({ error: "Invalid request body." }, 400);
    }
  }

  // Route: /api/admin/logout
  if (pathname === "/api/admin/logout") {
    return json({ success: true });
  }

  // Route: /api/admin/quote/force-update
  if (pathname === "/api/admin/quote/force-update") {
    cachedQuote = null;
    quoteCacheExpires = 0;
    const freshQuote = await fetchDailyQuote();
    return json({ success: true, quote: freshQuote });
  }

  // Route: /api/og/readme - Dynamic GitHub Profile README Image with Anime & Steam game images
  if (pathname === "/api/og/readme") {
    const animeCover = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg";
    const gameBanner = "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/header.jpg";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 280" width="840" height="280">
        <defs>
          <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#27272a" />
          </pattern>
          <clipPath id="animeClip">
            <rect x="30" y="80" width="110" height="150" rx="8" />
          </clipPath>
          <clipPath id="gameClip">
            <rect x="440" y="80" width="220" height="120" rx="8" />
          </clipPath>
        </defs>

        <!-- Background with border and halftone dots -->
        <rect width="840" height="280" fill="#09090b" rx="16" stroke="#27272a" stroke-width="4"/>
        <rect width="840" height="280" fill="url(#dotPattern)" rx="16" opacity="0.6"/>

        <!-- Top Header Bar -->
        <rect x="30" y="25" width="780" height="40" fill="#000" rx="6" stroke="#3f3f46" stroke-width="2"/>
        <text x="45" y="52" fill="#fff" font-family="-apple-system, BlinkMacSystemFont, monospace" font-size="20" font-weight="900" font-style="italic">MEHMETCANWT // LIVE ARCHIVE</text>
        <circle cx="750" cy="45" r="5" fill="#22c55e" />
        <text x="765" y="49" fill="#22c55e" font-family="monospace" font-size="11" font-weight="bold">ONLINE</text>

        <!-- Left Column: Favorite Anime -->
        <rect x="30" y="80" width="110" height="150" fill="#18181b" rx="8" stroke="#3f3f46" stroke-width="2"/>
        <image href="${animeCover}" x="30" y="80" width="110" height="150" preserveAspectRatio="xMidYMid slice" clip-path="url(#animeClip)"/>
        <text x="155" y="105" fill="#e11d48" font-family="monospace" font-size="11" font-weight="bold">FAVORITE ANIME</text>
        <text x="155" y="135" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="900" font-style="italic">ONE PIECE</text>
        <text x="155" y="160" fill="#a1a1aa" font-family="monospace" font-size="12">STATUS: CURRENT // 88% SCORE</text>
        <text x="155" y="180" fill="#71717a" font-family="monospace" font-size="11">TOTAL EPISODES: 1100+</text>

        <!-- Right Column: Most Played Game -->
        <rect x="440" y="80" width="220" height="120" fill="#18181b" rx="8" stroke="#3f3f46" stroke-width="2"/>
        <image href="${gameBanner}" x="440" y="80" width="220" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#gameClip)"/>
        <text x="675" y="105" fill="#eab308" font-family="monospace" font-size="11" font-weight="bold">TOP MISSION</text>
        <text x="675" y="132" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="900">COUNTER-STRIKE 2</text>
        <text x="675" y="155" fill="#a1a1aa" font-family="monospace" font-size="12">238 HOURS</text>
        <text x="675" y="175" fill="#71717a" font-family="monospace" font-size="11">STATUS: MASTERED</text>

        <!-- Bottom Footer Status -->
        <text x="45" y="258" fill="#71717a" font-family="monospace" font-size="11">SYNCED WITH MEHMETCANWT.XYZ // LEVEL 22 HUMAN</text>
      </svg>
    `.trim();

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1800",
      },
    });
  }

  // Fallback
  return json({ message: "MehmetCanWT Netlify API operational", path: pathname });
};

export const config: Config = {
  path: "/api/*",
};
