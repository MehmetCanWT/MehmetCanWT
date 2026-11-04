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

export interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl?: string;
  avatar: string;
  avatarframe?: string;
  level: number;
  totalHours: number;
  accountValueUsd?: number;
  backgroundVideoWebm?: string;
  backgroundVideoMp4?: string;
  backgroundPoster?: string;
  lastUpdated?: string;
}

export interface GamesResponse {
  profile?: SteamProfile;
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
  display_name?: string;
  global_name?: string;
  avatar_decoration_data?: {
    asset?: string;
    sku_id?: string;
  };
  primary_guild?: {
    badge?: string;
    tag?: string;
  };
}

export interface DiscordActivity {
  type: number;
  name: string;
  details?: string;
  details_url?: string;
  state?: string;
  application_id?: string;
  id?: string;
  buttons?: string[];
  timestamps?: {
    start?: number;
    end?: number;
  };
  emoji?: {
    name?: string;
    id?: string;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export interface DiscordData {
  discord_user: DiscordUser;
  discord_status: string;
  activities: DiscordActivity[];
  spotify?: {
    track_id?: string;
    song: string;
    artist: string;
    album?: string;
    album_art_url: string;
    timestamps?: {
      start?: number;
      end?: number;
    };
  };
}
