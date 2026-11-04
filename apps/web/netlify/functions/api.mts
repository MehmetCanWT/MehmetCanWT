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

interface SteamProfile {
  steamid: string;
  personaname: string;
  avatar: string;
  avatarframe?: string;
  level: number;
  totalHours: number;
  accountValueUsd?: number;
  backgroundVideoWebm?: string;
  backgroundVideoMp4?: string;
  backgroundPoster?: string;
  lastUpdated: string;
}

const DEFAULT_STEAM_PROFILE: SteamProfile = {
  steamid: process.env.STEAM_ID || "",
  personaname: "FemboyMemo",
  avatar: "https://shared.akamai.steamstatic.com/community_assets/images/items/1385730/b2bba5dcd8e2942ec5ba7639ea6622753e6005ad.gif",
  avatarframe: "https://shared.fastly.steamstatic.com/community_assets/images/items/527230/18ec71cb7da1182d32164890bac8411a09e26e46.png",
  level: 54,
  totalHours: 8901,
  accountValueUsd: 585,
  backgroundVideoWebm: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/7890df00a25ba9bbb8947df4205e04c88006852b.webm",
  backgroundVideoMp4: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/8225c97a6365c6fefdd41afc76012c1e117fa3a2.mp4",
  backgroundPoster: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/468af81383083392a90b6434813cbd741c3da7cf.jpg",
  lastUpdated: new Date().toISOString(),
};

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

// Curated verified games with accurate playtimes from SteamDB profile
const FALLBACK_GAMES: SteamGame[] = [
  {
    appid: 346110,
    name: "ARK: Survival Evolved",
    playtime_forever: 110640, // 1,844.0 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/capsule_184x69.jpg",
  },
  {
    appid: 2399830,
    name: "ARK: Survival Ascended",
    playtime_forever: 75696, // 1,261.6 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2399830/capsule_184x69.jpg",
  },
  {
    appid: 1172470,
    name: "Apex Legends",
    playtime_forever: 47064, // 784.4 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/capsule_184x69.jpg",
  },
  {
    appid: 730,
    name: "Counter-Strike 2",
    playtime_forever: 46692, // 778.2 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg",
  },
  {
    appid: 413150,
    name: "Stardew Valley",
    playtime_forever: 40752, // 679.2 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg",
  },
  {
    appid: 359550,
    name: "Tom Clancy's Rainbow Six Siege",
    playtime_forever: 33066, // 551.1 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/359550/capsule_184x69.jpg",
  },
  {
    appid: 252950,
    name: "Rocket League",
    playtime_forever: 26598, // 443.3 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252950/capsule_184x69.jpg",
  },
  {
    appid: 1149720,
    name: "Hentai Girl",
    playtime_forever: 15492, // 258.2 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149720/capsule_184x69.jpg",
  },
  {
    appid: 2424850,
    name: "TBH: Task Bar Hero",
    playtime_forever: 10494, // 174.9 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2424850/capsule_184x69.jpg",
  },
  {
    appid: 444090,
    name: "Paladins",
    playtime_forever: 4152, // 69.2 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/444090/capsule_184x69.jpg",
  },
  {
    appid: 1222670,
    name: "The Sims™ 4",
    playtime_forever: 3978, // 66.3 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1222670/capsule_184x69.jpg",
  },
  {
    appid: 322330,
    name: "Don't Starve Together",
    playtime_forever: 3306, // 55.1 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322330/capsule_184x69.jpg",
  },
  {
    appid: 291550,
    name: "Brawlhalla",
    playtime_forever: 2826, // 47.1 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/291550/capsule_184x69.jpg",
  },
  {
    appid: 1293830,
    name: "Forza Horizon 4",
    playtime_forever: 2820, // 47.0 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1293830/capsule_184x69.jpg",
  },
  {
    appid: 648800,
    name: "Raft",
    playtime_forever: 2778, // 46.3 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/capsule_184x69.jpg",
  },
  {
    appid: 292030,
    name: "The Witcher 3: Wild Hunt — Remastered",
    playtime_forever: 2760, // 46.0 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg",
  },
  {
    appid: 361420,
    name: "ASTRONEER",
    playtime_forever: 2514, // 41.9 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/361420/capsule_184x69.jpg",
  },
  {
    appid: 1231660,
    name: "Hentai Girl Linda",
    playtime_forever: 2244, // 37.4 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1231660/capsule_184x69.jpg",
  },
  {
    appid: 524220,
    name: "NieR:Automata™",
    playtime_forever: 1926, // 32.1 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/524220/capsule_184x69.jpg",
  },
  {
    appid: 49520,
    name: "Borderlands 2",
    playtime_forever: 1914, // 31.9 hrs
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/49520/capsule_184x69.jpg",
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
            score(format: POINT_5)
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
      COMPLETED: 0,
      CURRENT: 1,
      REPEATING: 1,
      DROPPED: 2,
      PLANNING: 3,
      PAUSED: 4,
    };

    const sorted = entries.sort((a, b) => {
      // 1. Star Rating (Score) descending: 5 stars -> 4 stars -> unrated (0)
      const scoreA = a.userScore || 0;
      const scoreB = b.userScore || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // 2. Status order: COMPLETED -> CURRENT -> DROPPED -> PLANNING
      const orderA = statusOrder[a.status] ?? 99;
      const orderB = statusOrder[b.status] ?? 99;
      if (orderA !== orderB) return orderA - orderB;

      // 3. Average Score
      return (b.averageScore || 0) - (a.averageScore || 0);
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

// --- Steam Fetcher with 6-Hour Cache & Dynamic Profile Scraper ---
async function fetchSteamData(steamId: string, webKey?: string): Promise<{ profile: SteamProfile; games: SteamGame[] }> {
  const cacheKey = `steam-full-${steamId}`;
  const cached = getCached<{ profile: SteamProfile; games: SteamGame[] }>(cacheKey);
  if (cached) return cached;

  let profile: SteamProfile = { ...DEFAULT_STEAM_PROFILE, steamid: steamId };
  let scrapedGames: SteamGame[] = [];

  // 1. Try official Steam Web API if key is available
  if (webKey) {
    try {
      const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${webKey}&steamid=${steamId}&format=json&include_appinfo=1&include_played_free_games=1`;
      const res = await fetchWithTimeout(url, {}, 4000);
      if (res.ok) {
        const data = await res.json();
        const games = data?.response?.games;
        if (Array.isArray(games) && games.length > 0) {
          scrapedGames = games.map((g: any) => ({
            appid: g.appid,
            name: g.name,
            playtime_forever: g.playtime_forever || 0,
            img_icon_url: g.img_icon_url || "",
          }));
        }
      }
    } catch (e) {
      console.warn("Steam Web API fetch failed:", e);
    }
  }

  // 2. Scrape live Steam Community profile for animated background video, real hours, avatar, and games
  try {
    const profileUrl = `https://steamcommunity.com/id/FemboyMemo`;
    const res = await fetchWithTimeout(
      profileUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      },
      4500
    );

    if (res.ok) {
      const html = await res.text();

      // Persona Name
      const nameMatch = html.match(/<span class="actual_persona_name">([^<]+)<\/span>/);
      if (nameMatch) profile.personaname = nameMatch[1].trim();

      // Player Level
      const levelMatch = html.match(/<span class="friendPlayerLevelNum">(\d+)<\/span>/);
      if (levelMatch) profile.level = parseInt(levelMatch[1], 10);

      // Animated Avatar GIF
      const avatarMatch = html.match(/<div class="playerAvatarAutoSizeInner">[\s\S]*?<img [^>]*srcset="([^"]+)"|<div class="playerAvatarAutoSizeInner">[\s\S]*?<img src="([^"]+)"/);
      if (avatarMatch) {
        profile.avatar = avatarMatch[1] || avatarMatch[2];
      }

      // Animated Avatar Frame
      const frameMatch = html.match(/class="profile_avatar_frame"[\s\S]*?<img src="([^"]+)"/);
      if (frameMatch) {
        profile.avatarframe = frameMatch[1];
      }

      // Steam Points Shop Background Animated Video (MP4 / WebM / Poster)
      const posterMatch = html.match(/class="profile_animated_background"[\s\S]*?poster="([^"]+)"/);
      if (posterMatch) profile.backgroundPoster = posterMatch[1];

      const webmMatch = html.match(/class="profile_animated_background"[\s\S]*?<source src="([^"]+\.webm)"/);
      if (webmMatch) profile.backgroundVideoWebm = webmMatch[1];

      const mp4Match = html.match(/class="profile_animated_background"[\s\S]*?<source src="([^"]+\.mp4)"/);
      if (mp4Match) profile.backgroundVideoMp4 = mp4Match[1];

      // Favorite game showcase (ARK: Survival Evolved - 1,844 hrs)
      const favMatch = html.match(
        /class="favoritegame_showcase_game[\s\S]*?app\/(\d+)[\s\S]*?showcase_item_detail_title[\s\S]*?>\s*([^<]+)\s*<\/a>[\s\S]*?class="value">([\d,.]+)\s*<\/div>\s*<div class="label">Hours played/i
      );
      if (favMatch) {
        const appid = parseInt(favMatch[1], 10);
        const name = favMatch[2].trim();
        const hours = parseFloat(favMatch[3].replace(/,/g, ""));
        if (!isNaN(appid) && !isNaN(hours)) {
          scrapedGames.push({
            appid,
            name,
            playtime_forever: Math.round(hours * 60),
            img_icon_url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`,
          });
        }
      }

      // Recent games list (Counter-Strike 2 - 778 hrs, Silksong, etc.)
      const recentRegex = /<div class="game_info">[\s\S]*?app\/(\d+)[\s\S]*?class="game_info_details">\s*([\d,.]+)\s*hrs on record[\s\S]*?class="game_name"><a class="whiteLink"[^>]*>([^<]+)<\/a>/gi;
      let match;
      while ((match = recentRegex.exec(html)) !== null) {
        const appid = parseInt(match[1], 10);
        const hours = parseFloat(match[2].replace(/,/g, ""));
        const name = match[3].trim();
        if (!isNaN(appid) && !scrapedGames.some((g) => g.appid === appid)) {
          scrapedGames.push({
            appid,
            name,
            playtime_forever: Math.round(hours * 60),
            img_icon_url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`,
          });
        }
      }
    }
  } catch (e) {
    console.error("Steam public community scrape failed:", e);
  }

  // Merge with curated fallbacks to ensure rich library
  const combinedGames = [...scrapedGames];
  for (const fb of FALLBACK_GAMES) {
    if (!combinedGames.some((g) => g.appid === fb.appid)) {
      combinedGames.push(fb);
    }
  }

  profile.lastUpdated = new Date().toISOString();
  const result = { profile, games: combinedGames };

  // 6-Hour Cache TTL (6 * 3600 seconds)
  setCache(cacheKey, result, 21600);
  return result;
}

async function fetchSteamGames(steamId: string, webKey?: string): Promise<SteamGame[]> {
  const data = await fetchSteamData(steamId, webKey);
  return data.games;
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
      { title: "ARK: SURVIVAL ASCENDED & CS2 MAJOR PATCH NOTES LIVE", source: "Gaming" },
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

// Helper to fetch external image as Base64 data URL for GitHub README embedding
async function fetchAsBase64(url: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(url, { headers: { "User-Agent": "Mozilla/5.0" } }, 3500);
    if (!res.ok) return url;
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const mime = url.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${b64}`;
  } catch {
    return url;
  }
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
    const steamId = process.env.STEAM_ID || "";
    const webKey = process.env.WEB_KEY || "";
    const steamData = await fetchSteamData(steamId, webKey);
    return json({
      profile: steamData.profile,
      allGames: steamData.games,
      pinnedIds: [346110, 730], // ARK and Counter-Strike 2 pinned
    });
  }

  // Route: /api/lanyard
  if (pathname === "/api/lanyard" || pathname === "/api/discord") {
    const discordId = process.env.DISCORD_ID || "";
    if (!discordId) {
      return json({ error: "DISCORD_ID environment variable not set." }, 404);
    }
    try {
      const lanyardRes = await fetchWithTimeout(`https://api.lanyard.rest/v1/users/${discordId}`, {}, 3500);
      if (lanyardRes.ok) {
        const lData = await lanyardRes.json();
        return json({ ...lData, discord_id: discordId });
      }
    } catch (e) {
      console.warn("Lanyard proxy fetch failed:", e);
    }
    return json({ error: "Failed to fetch Discord telemetry" }, 502);
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
      const expectedPassword = process.env.ADMIN_PASSWORD || "";
      if (!expectedPassword || !body?.password || body.password !== expectedPassword) {
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
    memoryCache.delete("daily-quote");
    const freshQuote = await fetchDailyQuote();
    return json({ success: true, quote: freshQuote });
  }

  // Route: /api/admin/fresh-data (0'dan her şeyi yenileyen ve cache'i temizleyen route)
  if (pathname === "/api/admin/fresh-data") {
    memoryCache.clear();
    const steamId = process.env.STEAM_ID || "";

    const [anime, steamData, quote] = await Promise.all([
      fetchAniList("MehmetCanWT"),
      fetchSteamData(steamId, process.env.WEB_KEY),
      fetchDailyQuote(),
    ]);

    return json({
      success: true,
      message: "Tüm sistem önbelleği sıfırlandı ve 100% taze canlı veriler çekildi.",
      timestamp: new Date().toISOString(),
      summary: {
        animeCount: anime.length,
        gamesCount: steamData.games.length,
        steamUser: steamData.profile.personaname,
        steamLevel: steamData.profile.level,
        quoteCharacter: quote.character,
      },
    });
  }

  // Route: /api/og/readme - Dynamic GitHub Profile README Image with Anime & Steam game images
  if (pathname === "/api/og/readme") {
    let discordStatus = "ONLINE";
    let discordColor = "#22c55e";

    const discordId = process.env.DISCORD_ID || "";
    if (discordId) {
      try {
        const lanyardRes = await fetchWithTimeout(
          `https://api.lanyard.rest/v1/users/${discordId}`,
          {},
          2000
        );
        if (lanyardRes.ok) {
          const lData = await lanyardRes.json();
          const st = lData?.data?.discord_status;
          if (st === "online") {
            discordStatus = "ONLINE";
            discordColor = "#22c55e";
          } else if (st === "dnd") {
            discordStatus = "DO NOT DISTURB";
            discordColor = "#ef4444";
          } else if (st === "idle") {
            discordStatus = "AWAY";
            discordColor = "#eab308";
          } else if (st === "offline") {
            discordStatus = "OFFLINE";
            discordColor = "#71717a";
          }
        }
      } catch {
        // ignore
      }
    }

    const animeCover = "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg";
    const gameBanner = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg";

    const [animeBase64, gameBase64] = await Promise.all([
      fetchAsBase64(animeCover),
      fetchAsBase64(gameBanner),
    ]);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 320" width="860" height="320">
        <defs>
          <pattern id="dotPattern" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#2d1525" />
          </pattern>
          <clipPath id="animeClip">
            <rect x="58" y="112" width="90" height="120" rx="8" />
          </clipPath>
          <clipPath id="gameClip">
            <rect x="455" y="122" width="120" height="68" rx="6" />
          </clipPath>
        </defs>

        <!-- Cyber Obsidian Background -->
        <rect width="860" height="320" fill="#0c0a0f" rx="16" stroke="#3b1828" stroke-width="4"/>
        <rect width="860" height="320" fill="url(#dotPattern)" rx="16" opacity="0.8"/>

        <!-- Top Header Bar -->
        <rect x="35" y="24" width="790" height="42" fill="#0c0a0f" rx="6" stroke="#e11d48" stroke-width="2.5"/>
        <text x="50" y="52" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, monospace" font-size="20" font-weight="900" font-style="italic">MEHMETCANWT // LIVE ARCHIVE</text>
        <rect x="740" y="32" width="75" height="26" fill="#052e16" rx="4" stroke="#22c55e" stroke-width="1.5" />
        <circle cx="752" cy="45" r="4.5" fill="${discordColor}" />
        <text x="762" y="49" fill="${discordColor}" font-family="monospace" font-size="11" font-weight="900">${discordStatus}</text>

        <!-- Left Column: Favorite Anime Card -->
        <rect x="35" y="86" width="380" height="175" fill="#150a12" rx="10" stroke="#e11d48" stroke-width="2.5"/>
        <rect x="58" y="112" width="90" height="120" fill="#000" rx="8" stroke="#e11d48" stroke-width="2"/>
        <image href="${animeBase64}" x="58" y="112" width="90" height="120" preserveAspectRatio="xMidYMid slice" clip-path="url(#animeClip)"/>
        
        <rect x="165" y="110" width="180" height="20" fill="#e11d48" rx="4" />
        <text x="175" y="124" fill="#ffffff" font-family="monospace" font-size="10" font-weight="900" letter-spacing="1">TOP PICK // FAVORITE ANIME</text>
        <text x="165" y="156" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="900" font-style="italic">ONE PIECE</text>
        <text x="165" y="180" fill="#fb7185" font-family="monospace" font-size="11" font-weight="bold">★ 5/5 STARS // STATUS: CURRENT</text>
        <text x="165" y="202" fill="#facc15" font-family="monospace" font-size="12" font-weight="900">1180+ EPISODES LOGGED</text>

        <!-- Right Column: Top Mission Card -->
        <rect x="435" y="86" width="390" height="175" fill="#181308" rx="10" stroke="#f59e0b" stroke-width="2.5"/>
        <rect x="455" y="122" width="120" height="68" fill="#000" rx="6" stroke="#f59e0b" stroke-width="2"/>
        <image href="${gameBase64}" x="455" y="122" width="120" height="68" preserveAspectRatio="xMidYMid slice" clip-path="url(#gameClip)"/>
        
        <rect x="590" y="110" width="170" height="20" fill="#f59e0b" rx="4" />
        <text x="600" y="124" fill="#000000" font-family="monospace" font-size="10" font-weight="900" letter-spacing="1">TOP MISSION // MASTERED</text>
        <text x="590" y="156" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="900" font-style="italic">ARK: SURVIVAL</text>
        <text x="590" y="180" fill="#fde047" font-family="monospace" font-size="13" font-weight="900">1,844 HOURS RECORDED</text>
        <text x="590" y="202" fill="#4ade80" font-family="monospace" font-size="11" font-weight="bold">VERIFIED MISSION RECORD</text>

        <!-- Bottom Footer Status -->
        <text x="35" y="295" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="900">SYNCED WITH MEHMETCANWT.XYZ</text>
        <text x="590" y="295" fill="#c084fc" font-family="monospace" font-size="11" font-weight="900">LEVEL 22 HUMAN // ARCHIVE NODE 01</text>
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
