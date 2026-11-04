import { withCache } from './cache';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
  capsule_image?: string;
}

const REAL_FALLBACK_GAMES: SteamGame[] = [
  { appid: 346110, name: "ARK: Survival Evolved", playtime_forever: 110640, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/capsule_184x69.jpg" },
  { appid: 2399830, name: "ARK: Survival Ascended", playtime_forever: 75696, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2399830/capsule_184x69.jpg" },
  { appid: 1172470, name: "Apex Legends", playtime_forever: 47064, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/capsule_184x69.jpg" },
  { appid: 730, name: "Counter-Strike 2", playtime_forever: 46692, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg" },
  { appid: 413150, name: "Stardew Valley", playtime_forever: 40752, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg" },
  { appid: 359550, name: "Tom Clancy's Rainbow Six Siege", playtime_forever: 33066, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/359550/capsule_184x69.jpg" },
  { appid: 252950, name: "Rocket League", playtime_forever: 26598, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252950/capsule_184x69.jpg" },
  { appid: 1149720, name: "Hentai Girl", playtime_forever: 15492, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149720/capsule_184x69.jpg" },
  { appid: 2424850, name: "TBH: Task Bar Hero", playtime_forever: 10494, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2424850/capsule_184x69.jpg" },
  { appid: 444090, name: "Paladins", playtime_forever: 4152, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/444090/capsule_184x69.jpg" },
  { appid: 1222670, name: "The Sims™ 4", playtime_forever: 3978, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1222670/capsule_184x69.jpg" },
  { appid: 322330, name: "Don't Starve Together", playtime_forever: 3306, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/322330/capsule_184x69.jpg" },
  { appid: 291550, name: "Brawlhalla", playtime_forever: 2826, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/291550/capsule_184x69.jpg" },
  { appid: 1293830, name: "Forza Horizon 4", playtime_forever: 2820, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1293830/capsule_184x69.jpg" },
  { appid: 648800, name: "Raft", playtime_forever: 2778, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/capsule_184x69.jpg" },
  { appid: 292030, name: "The Witcher 3: Wild Hunt — Remastered", playtime_forever: 2760, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/capsule_184x69.jpg" },
  { appid: 361420, name: "ASTRONEER", playtime_forever: 2514, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/361420/capsule_184x69.jpg" },
  { appid: 1231660, name: "Hentai Girl Linda", playtime_forever: 2244, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1231660/capsule_184x69.jpg" },
  { appid: 524220, name: "NieR:Automata™", playtime_forever: 1926, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/524220/capsule_184x69.jpg" },
  { appid: 49520, name: "Borderlands 2", playtime_forever: 1914, img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/49520/capsule_184x69.jpg" },
];

export async function getAllGames(steamId: string): Promise<SteamGame[]> {
  return withCache(`steam-all-${steamId}`, 3600, async () => {
    if (process.env.WEB_KEY && steamId) {
      try {
        const response = await fetch(
          `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.WEB_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&include_extended_appinfo=true&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          const games = data?.response?.games;
          if (Array.isArray(games) && games.length > 0) {
            return games.map((g: any) => ({
              appid: g.appid,
              name: g.name,
              playtime_forever: g.playtime_forever || 0,
              playtime_2weeks: g.playtime_2weeks,
              img_icon_url: g.img_icon_url ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg` : `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${g.appid}/capsule_184x69.jpg`,
            }));
          }
        }
      } catch (error) {
        console.error("Steam Web API Fetch Error:", error);
      }
    }

    // Try scraping public profile
    try {
      const res = await fetch(`https://steamcommunity.com/id/FemboyMemo`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (res.ok) {
        const html = await res.text();
        const scraped: SteamGame[] = [];
        const regex = /<div class="game_info">[\s\S]*?app\/(\d+)[\s\S]*?class="game_info_details">\s*([\d,.]+)\s*hrs on record[\s\S]*?class="game_name"><a class="whiteLink"[^>]*>([^<]+)<\/a>/gi;
        let match;
        while ((match = regex.exec(html)) !== null) {
          const appid = parseInt(match[1], 10);
          const hours = parseFloat(match[2].replace(/,/g, ""));
          const name = match[3].trim();
          if (!isNaN(appid) && !scraped.some((s) => s.appid === appid)) {
            scraped.push({
              appid,
              name,
              playtime_forever: Math.round(hours * 60),
              img_icon_url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`,
            });
          }
        }
        if (scraped.length > 0) {
          // Merge with real baseline to complete full top list
          const merged = [...scraped];
          for (const real of REAL_FALLBACK_GAMES) {
            if (!merged.some((m) => m.appid === real.appid)) {
              merged.push(real);
            }
          }
          return merged;
        }
      }
    } catch (e) {
      console.warn("Public steam scrape fallback:", e);
    }

    return REAL_FALLBACK_GAMES;
  });
}
