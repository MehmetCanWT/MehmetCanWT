import { withCache } from './cache';

export interface LanyardData {
  discord_user: {
    username: string;
    public_flags: number;
    id: string;
    discriminator: string;
    avatar: string;
  };
  spotify: {
    track_id: string;
    timestamps: {
      start: number;
      end: number;
    };
    song: string;
    artist: string;
    album_art_url: string;
    album: string;
  } | null;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
    type: number;
    state: string;
    name: string;
    id: string;
    application_id?: string;
    emoji?: {
      name: string;
      id: string;
      animated: boolean;
    };
    created_at: number;
    assets?: {
      small_text: string;
      small_image: string;
      large_text: string;
      large_image: string;
    };
    details: string;
  }>;
  active_on_discord_web: boolean;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
}

export async function getDiscordStatus(userId: string): Promise<LanyardData | null> {
  return withCache(`discord-${userId}`, 30, async () => {
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
        headers: {
          Authorization: process.env.LANYARD_API_KEY || "",
        }
      });
      const json = await response.json();
      if (json.success) {
        return json.data;
      }
      return null;
    } catch {
      return null;
    }
  });
}
