import { Radio, Music2, Gamepad2, Activity, Disc3 } from 'lucide-react';
import type { DiscordData, DiscordActivity } from '../../types';

interface DiscordPresenceProps {
  discord: DiscordData | null;
}

export default function DiscordPresence({ discord }: DiscordPresenceProps) {
  const avatarExt = discord?.discord_user?.avatar?.startsWith('a_') ? 'gif' : 'png';
  const avatarUrl = discord?.discord_user?.avatar
    ? `https://cdn.discordapp.com/avatars/${discord.discord_user.id}/${discord.discord_user.avatar}.${avatarExt}?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const statusColor = 
    discord?.discord_status === 'online' ? 'bg-emerald-500' :
    discord?.discord_status === 'dnd' ? 'bg-rose-500' :
    discord?.discord_status === 'idle' ? 'bg-amber-400' : 'bg-zinc-500';

  const statusText =
    discord?.discord_status === 'online' ? 'ONLINE' :
    discord?.discord_status === 'dnd' ? 'DO NOT DISTURB' :
    discord?.discord_status === 'idle' ? 'IDLE / AWAY' : 'OFFLINE';

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
          <Radio size={20} className={discord?.discord_status === 'online' ? "text-emerald-500 animate-pulse" : "text-zinc-500"} />
          <span>LIVE TELEMETRY</span>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
          discord?.discord_status === 'online' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
        }`}>
          {statusText}
        </span>
      </div>

      <div className="manga-panel bg-white text-black dark:bg-zinc-900 dark:text-white p-5 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
        {discord && discord.discord_user ? (
          <div className="space-y-4">
            {/* User Profile Info */}
            <div className="flex items-center gap-4 border-b-2 border-dashed border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="relative flex-shrink-0">
                <img
                  loading="lazy"
                  src={avatarUrl}
                  alt={discord.discord_user.username}
                  className="w-16 h-16 border-3 border-black dark:border-white/30 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-3 border-black dark:border-zinc-900 rounded-full ${statusColor}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-black uppercase italic text-xl truncate">
                    {discord.discord_user.display_name || discord.discord_user.username}
                  </h4>
                </div>
                <p className="text-xs font-mono font-bold text-zinc-500 uppercase truncate">
                  @{discord.discord_user.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${statusColor} ${discord.discord_status === 'online' ? 'animate-ping' : ''}`} />
                  <span className="text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">
                    DISCORD UPLINK ACTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Status Emoji & Text */}
            {discord.activities?.find((a) => a.type === 4 && (a.state || a.emoji)) && (
              <div className="bg-zinc-50 dark:bg-zinc-800/80 border-2 border-black p-2.5 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {discord.activities.find((a) => a.type === 4)?.emoji?.name && (
                  <span className="text-base">{discord.activities.find((a) => a.type === 4)?.emoji?.name}</span>
                )}
                <span className="italic truncate">{discord.activities.find((a) => a.type === 4)?.state || 'Connected to Node 01'}</span>
              </div>
            )}

            {/* Activities (YouTube Music, Games, Apps) */}
            {(discord.activities || []).filter((a: DiscordActivity) => a.type !== 4).map((activity: DiscordActivity, i: number) => {
              const imageSrc = activity.assets?.large_image?.startsWith('mp:external')
                ? activity.assets.large_image.replace(/mp:external\/.*\/https\//, 'https://')
                : activity.assets?.large_image
                ? `https://cdn.discordapp.com/app-assets/${activity.application_id || activity.id}/${activity.assets.large_image}.png`
                : null;

              return (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-800/80 border-2 border-black p-3 space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 italic uppercase flex items-center gap-1">
                      {activity.type === 0 ? <Gamepad2 size={11} /> : activity.type === 2 ? <Music2 size={11} /> : <Activity size={11} />}
                      {activity.type === 0 ? 'PLAYING MISSION' : activity.type === 2 ? 'LISTENING STREAM' : 'ACTIVE TASK'}
                    </p>
                  </div>
                  <div className="flex gap-3 items-center">
                    {imageSrc && (
                      <img
                        loading="lazy"
                        src={imageSrc}
                        className="border-2 border-black dark:border-white/20 flex-shrink-0 w-12 h-12 object-cover rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        alt={activity.name}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm uppercase truncate italic">{activity.name}</p>
                      {activity.details && (
                        <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate">{activity.details}</p>
                      )}
                      {activity.state && (
                        <p className="text-[10px] font-bold text-zinc-500 uppercase truncate">{activity.state}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Spotify Activity */}
            {discord.spotify && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-600 p-3 space-y-2 shadow-[2px_2px_0px_0px_rgba(16,185,129,0.5)]">
                <p className="text-[10px] font-black bg-emerald-600 text-white inline-flex items-center gap-1 px-1.5 py-0.5 italic uppercase">
                  <Disc3 size={11} className="animate-spin" /> SPOTIFY BROADCAST
                </p>
                <div className="flex gap-3 items-center">
                  <img
                    loading="lazy"
                    src={discord.spotify.album_art_url}
                    className="border-2 border-emerald-700 flex-shrink-0 w-12 h-12 object-cover rounded-sm"
                    alt={discord.spotify.album}
                  />
                  <div className="min-w-0">
                    <p className="font-black text-sm uppercase truncate italic">{discord.spotify.song}</p>
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 truncate">{discord.spotify.artist}</p>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase truncate">{discord.spotify.album}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <Radio size={32} className="mx-auto text-zinc-400 animate-pulse" />
            <p className="font-black uppercase text-sm tracking-wider">AWAITING DISCORD SIGNAL</p>
            <p className="text-[11px] text-zinc-500 font-mono">Telemetry link is actively syncing</p>
          </div>
        )}
      </div>
    </section>
  );
}
