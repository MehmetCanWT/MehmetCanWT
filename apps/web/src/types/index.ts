export interface AnimeEntry {
  id: number;
  title: { english: string; romaji: string };
  coverImage: { large: string };
  status: string;
  averageScore: number;
  userScore: number;
  progress: number;
  format?: string;
  description?: string;
}

export interface AnimeResponse {
  allAnime: AnimeEntry[];
  pinnedIds: number[];
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
}

export interface GamesResponse {
  allGames: SteamGame[];
  pinnedIds: number[];
}

export interface NewsItem {
  title: string;
  source: string;
}

export interface GuestbookEntry {
  id: number;
  username: string;
  message: string;
  createdAt: string;
}

export interface QuoteData {
  quote: string;
  character: string;
  anime: string;
  characterImage?: string;
  animeImage?: string;
  isFallback?: boolean;
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
}

export interface DiscordActivity {
  type: number;
  name: string;
  details?: string;
  state?: string;
  application_id?: string;
  id?: string;
  assets?: {
    large_image?: string;
    small_image?: string;
  };
}

export interface DiscordData {
  discord_user: DiscordUser;
  discord_status: string;
  activities: DiscordActivity[];
  spotify?: {
    song: string;
    artist: string;
    album_art_url: string;
  };
}
