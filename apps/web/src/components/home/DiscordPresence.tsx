import { Radio } from 'lucide-react';
import type { DiscordData, DiscordActivity } from '../../types';

interface DiscordPresenceProps {
  discord: DiscordData | null;
}

export default function DiscordPresence({ discord }: DiscordPresenceProps) {
  return (
    <section className="space-y-4">
      <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
        <Radio size={20} className="animate-pulse" /> LIVE TELEMETRY
      </div>
      <div className="manga-panel bg-white text-black dark:bg-zinc-800 dark:text-white">
        {discord && discord.discord_user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b-4 border-black dark:border-white/20 pb-4">
              <div className="relative flex-shrink-0">
                <img
                  loading="lazy"
                  src={`https://cdn.discordapp.com/avatars/${discord.discord_user.id}/${discord.discord_user.avatar}.png`}
                  alt="Avatar"
                  className="border-4 border-black dark:border-white/20 w-16 h-16"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-black dark:border-zinc-800 rounded-full ${
                  discord.discord_status === 'online' ? 'bg-green-500' :
                  discord.discord_status === 'dnd' ? 'bg-red-500' :
                  discord.discord_status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
              </div>
              <div>
                <h4 className="font-black uppercase italic text-xl">{discord.discord_user.username}</h4>
                <p className="text-xs font-bold text-gray-500 uppercase">STATUS: {discord.discord_status}</p>
              </div>
            </div>

            {/* Activity Detail */}
            {(discord.activities || []).filter((a: DiscordActivity) => a.type !== 4).map((activity: DiscordActivity, i: number) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white/20 p-3 space-y-2">
                <p className="text-[10px] font-black bg-black text-white dark:bg-white dark:text-black inline-block px-1 italic uppercase">
                  {activity.type === 0 ? 'PLAYING' : activity.type === 2 ? 'LISTENING' : 'ACTIVITY'}
                </p>
                <div className="flex gap-3">
                  {activity.assets?.large_image && (
                    <img
                      loading="lazy"
                      src={activity.assets.large_image.startsWith('mp:external')
                        ? activity.assets.large_image.replace(/mp:external\/.*\/https\//, 'https://')
                        : `https://cdn.discordapp.com/app-assets/${activity.application_id || activity.id}/${activity.assets.large_image}.png`}
                      className="border-2 border-black dark:border-white/20 flex-shrink-0 w-12 h-12"
                      alt={activity.name}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-black text-sm uppercase truncate italic">{activity.name}</p>
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase truncate">{activity.details}</p>
                    <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase truncate">{activity.state}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Spotify */}
            {discord.spotify && (
              <div className="bg-green-50 dark:bg-green-950 border-2 border-green-600 p-3 space-y-2">
                 <p className="text-[10px] font-black bg-green-600 text-white inline-block px-1 italic uppercase">SPOTIFY TRANSMISSION</p>
                 <div className="flex gap-3">
                    <img
                      loading="lazy"
                      src={discord.spotify.album_art_url}
                      className="border-2 border-green-600 flex-shrink-0 w-12 h-12"
                      alt="Spotify album art"
                    />
                    <div className="min-w-0">
                      <p className="font-black text-sm uppercase truncate text-green-800 dark:text-green-300 italic">{discord.spotify.song}</p>
                      <p className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase truncate">BY {discord.spotify.artist}</p>
                    </div>
                 </div>
              </div>
            )}

            {!(discord.activities || []).some((a: DiscordActivity) => a.type !== 4) && !discord.spotify && (
              <p className="text-xs font-bold italic text-gray-400 uppercase text-center py-4">NO ACTIVE TRANSMISSIONS FOUND</p>
            )}
          </div>
        ) : (
          <p className="text-center italic font-bold">LINKING TO DISCORD...</p>
        )}
      </div>
      <div className="text-[10px] font-black uppercase text-right text-gray-400">
        *UPDATES EVERY 30 SECONDS
      </div>
    </section>
  );
}
