export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
}

export async function getRecentGames(steamId: string): Promise<SteamGame[]> {
  // Using public SteamID dashboard data or a placeholder logic if API Key is missing.
  // For now, since we dont have the API Key, we will return a mock to show the UI.
  // In a real VDS environment, the user can set STEAM_API_KEY in .env.
  
  if (!process.env.STEAM_API_KEY) {
    return [
      { appid: 730, name: "Counter-Strike 2", playtime_forever: 5000, playtime_2weeks: 120, img_icon_url: "" },
      { appid: 570, name: "Dota 2", playtime_forever: 3000, playtime_2weeks: 60, img_icon_url: "" },
      { appid: 1091500, name: "Cyberpunk 2077", playtime_forever: 150, playtime_2weeks: 10, img_icon_url: "" },
    ];
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&format=json`
    );
    const data = await response.json();
    return data.response.games || [];
  } catch (error) {
    console.error("Steam Fetch Error:", error);
    return [];
  }
}
