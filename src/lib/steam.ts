export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
  capsule_image?: string;
}

export async function getAllGames(steamId: string): Promise<SteamGame[]> {
  if (!process.env.STEAM_API_KEY) {
    return [
      { appid: 730, name: "Counter-Strike 2", playtime_forever: 12450, playtime_2weeks: 450, img_icon_url: "" },
      { appid: 570, name: "Dota 2", playtime_forever: 8900, playtime_2weeks: 0, img_icon_url: "" },
      { appid: 440, name: "Team Fortress 2", playtime_forever: 4500, playtime_2weeks: 0, img_icon_url: "" },
      { appid: 271590, name: "Grand Theft Auto V", playtime_forever: 3200, playtime_2weeks: 120, img_icon_url: "" },
      { appid: 1091500, name: "Cyberpunk 2077", playtime_forever: 2100, playtime_2weeks: 300, img_icon_url: "" },
      { appid: 292030, name: "The Witcher 3: Wild Hunt", playtime_forever: 1800, playtime_2weeks: 0, img_icon_url: "" },
      { appid: 400, name: "Portal", playtime_forever: 120, playtime_2weeks: 0, img_icon_url: "" },
      { appid: 620, name: "Portal 2", playtime_forever: 500, playtime_2weeks: 0, img_icon_url: "" },
    ];
  }

  try {
    // include_played_free_games=true ensures free games like CS2/Dota 2 are included
    // include_extended_appinfo=true fetches more metadata
    const response = await fetch(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&include_extended_appinfo=true&format=json`
    );
    const data = await response.json();
    return data.response.games || [];
  } catch (error) {
    console.error("Steam Fetch Error:", error);
    return [];
  }
}

export async function getRecentGames(steamId: string): Promise<SteamGame[]> {
  if (!process.env.STEAM_API_KEY) return (await getAllGames(steamId)).slice(0, 3);

  try {
    const response = await fetch(
      `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&format=json`
    );
    const data = await response.json();
    return data.response.games || [];
  } catch (error) {
    console.error("Steam Recent Fetch Error:", error);
    return [];
  }
}
