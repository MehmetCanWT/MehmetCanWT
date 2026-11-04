import { useState, useEffect } from 'react';
import { Radio, ExternalLink, MoreHorizontal, Gamepad2, Code2, Music2 } from 'lucide-react';
import type { DiscordData, DiscordActivity } from '../../types';

interface DiscordPresenceProps {
  discord: DiscordData | null;
}

function resolveAssetUrl(activity?: DiscordActivity): string | null {
  if (!activity) return null;
  const raw = activity.assets?.large_image || activity.assets?.small_image;
  if (!raw) return null;

  if (raw.startsWith('mp:external/')) {
    // Discord Media Proxy native URL
    return `https://media.discordapp.net/external/${raw.replace('mp:external/', '')}`;
  }
  if (raw.startsWith('spotify:')) {
    return `https://i.scdn.co/image/${raw.replace('spotify:', '')}`;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${raw}.png`;
  }
  return null;
}

function formatDuration(ms: number): string {
  if (isNaN(ms) || ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function DiscordPresence({ discord }: DiscordPresenceProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const user = discord?.discord_user;
  const avatarExt = user?.avatar?.startsWith('a_') ? 'gif' : 'png';
  const avatarUrl = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const avatarDecorationUrl = user?.avatar_decoration_data?.asset
    ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png`
    : 'https://cdn.discordapp.com/avatar-decoration-presets/a_5889f65c4a28cdafc06847cc02790af1.png';

  const isOnline = discord?.discord_status === 'online';
  const isDnd = discord?.discord_status === 'dnd';
  const isIdle = discord?.discord_status === 'idle';

  const statusColor = isOnline
    ? 'bg-emerald-500'
    : isDnd
    ? 'bg-rose-500'
    : isIdle
    ? 'bg-amber-400'
    : 'bg-zinc-500';

  const customStatus = discord?.activities?.find((a) => a.type === 4);
  const statusEmoji = customStatus?.emoji?.name || '😘';

  // Support any live activity: Music, Game, VS Code / Terminal, Stream, etc.
  const mainActivity =
    (discord?.spotify
      ? {
          type: 2,
          name: 'Spotify',
          details: discord.spotify.song,
          state: discord.spotify.artist,
          assets: { large_image: discord.spotify.album_art_url },
          timestamps: { start: discord.spotify.timestamps?.start, end: discord.spotify.timestamps?.end },
          details_url: `https://open.spotify.com/track/${discord.spotify.track_id}`,
        }
      : null) ||
    discord?.activities?.find((a) => a.type !== 4);

  const activityImage = resolveAssetUrl(mainActivity as DiscordActivity | undefined);

  // Activity type badges & labels
  const isMusic = mainActivity?.type === 2 || mainActivity?.name === 'BitChord' || !!discord?.spotify;
  const isGame = mainActivity?.type === 0;
  const isStreaming = mainActivity?.type === 1;
  const isWatching = mainActivity?.type === 3;

  const activityHeader = isMusic
    ? `${mainActivity?.name || 'Müzik'} dinliyor`
    : isGame
    ? `${mainActivity?.name || 'Oyun'} oynuyor`
    : isStreaming
    ? `${mainActivity?.name || 'Yayın'} yapıyor`
    : isWatching
    ? `${mainActivity?.name || 'Video'} izliyor`
    : `${mainActivity?.name || 'Aktif'}`;

  // Calculate audio / session progress
  const startTs = mainActivity?.timestamps?.start;
  const endTs = mainActivity?.timestamps?.end;
  let progressPercent = 50;
  let currentFormatted = '00:00';
  let totalFormatted = '00:00';
  const hasTimeline = !!(startTs && endTs && endTs > startTs);

  if (hasTimeline && startTs && endTs) {
    const elapsed = Math.max(0, now - startTs);
    const total = endTs - startTs;
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    currentFormatted = formatDuration(elapsed);
    totalFormatted = formatDuration(total);
  } else if (startTs) {
    const elapsed = Math.max(0, now - startTs);
    currentFormatted = formatDuration(elapsed);
  }

  const actionUrl =
    mainActivity?.details_url ||
    (isMusic && mainActivity?.details
      ? `https://music.youtube.com/search?q=${encodeURIComponent(
          `${mainActivity.details} ${mainActivity.state || ''}`
        )}`
      : null);

  return (
    <section className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
          <Radio size={20} className={isOnline ? 'text-emerald-500 animate-pulse' : 'text-zinc-500'} />
          <span>LIVE TELEMETRY</span>
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            isOnline ? 'bg-emerald-500 text-black' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          {isOnline ? 'ONLINE' : isDnd ? 'DO NOT DISTURB' : isIdle ? 'AWAY' : 'OFFLINE'}
        </span>
      </div>

      {/* Discord Profile Card */}
      <div className="manga-panel relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#22070c] via-[#180509] to-[#0f0305] text-white border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)]">
        {/* Animated Discord Banner directly from Discord CDN */}
        <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-red-950 via-rose-900 to-amber-950">
          <img
            src="https://cdn.discordapp.com/banners/1245414098238177400/a_d10ee85d55ecca7c33e2d147d429a9f2.gif?size=600"
            alt="Discord Banner"
            className="w-full h-full object-cover object-top opacity-95"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/discord-banner.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#22070c] via-transparent to-black/20" />
        </div>

        {/* Content body */}
        <div className="px-5 pb-5 pt-0 space-y-4 relative">
          {/* Avatar row with centered wings decoration and status emoji bubble */}
          <div className="flex items-end gap-3 -mt-12 mb-2">
            {/* Perfectly centered 80x80 Avatar with precise 96x96 Discord decoration overlay */}
            <div className="relative w-20 h-20 shrink-0">
              {/* Circular Avatar */}
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#22070c] shadow-lg bg-zinc-950 relative z-0">
                <img
                  src={avatarUrl}
                  alt={user?.username || 'MehmetCan'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Wings Avatar Decoration Preset - Exactly centered (80px + 2*8px = 96px square) */}
              <img
                src={avatarDecorationUrl}
                alt="Avatar Decoration"
                className="absolute -top-2 -left-2 w-24 h-24 max-w-none pointer-events-none z-10 select-none object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />

              {/* Discord Status Dot */}
              <div
                className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-[#22070c] ${statusColor} z-20 ${
                  isOnline ? 'animate-pulse' : ''
                }`}
              />
            </div>

            {/* Custom Status Speech Bubble (Anchored next to avatar bottom right) */}
            <div className="mb-1.5 bg-[#2d0e14] border border-rose-500/30 rounded-2xl px-2.5 py-1 shadow-md flex items-center justify-center hover:scale-105 transition-transform z-20">
              <span className="text-xl leading-none">{statusEmoji}</span>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-white leading-none">
              {user?.display_name || 'MehmetCan'}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 flex-wrap">
              <span>{user?.username ? `@${user.username}` : 'femboymemo'}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-rose-300">Say/Gex</span>
              <span className="inline-flex items-center gap-1 bg-cyan-950/80 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-500/40 font-mono">
                💎 OPEN
              </span>
            </div>
          </div>

          {/* Live Activity Player / Status Card (Music, Game, App, Streaming) */}
          {mainActivity ? (
            <div className="bg-[#260a10] border border-rose-900/40 rounded-xl p-3.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-rose-300">
                  {isMusic ? (
                    <Music2 size={13} className="text-rose-400 animate-pulse" />
                  ) : isGame ? (
                    <Gamepad2 size={13} className="text-amber-400" />
                  ) : isStreaming ? (
                    <Radio size={13} className="text-purple-400 animate-pulse" />
                  ) : (
                    <Code2 size={13} className="text-cyan-400" />
                  )}
                  <span>{activityHeader}</span>
                </span>
                <MoreHorizontal size={14} className="text-zinc-500 cursor-pointer hover:text-white" />
              </div>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-rose-900/50 flex-shrink-0 bg-black shadow-md flex items-center justify-center relative">
                  {activityImage ? (
                    <img
                      src={activityImage}
                      alt={mainActivity?.details || mainActivity?.name || 'Activity'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        const parent = (e.currentTarget.parentElement as HTMLElement);
                        if (parent) {
                          parent.innerHTML = isMusic 
                            ? '<span class="text-rose-400 font-mono font-black text-[10px]">MUSIC</span>'
                            : '<span class="text-amber-400 font-mono font-black text-[10px]">GAME</span>';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-950/60">
                      {isMusic ? <Music2 size={20} className="text-rose-400" /> : <Gamepad2 size={20} className="text-amber-400" />}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm text-white truncate leading-tight">
                    {mainActivity?.details || mainActivity?.name || 'Active Session'}
                  </h4>
                  <p className="text-xs font-medium text-zinc-400 truncate mt-0.5">
                    {mainActivity?.state || (isGame ? 'Playing Now' : 'Online')}
                  </p>
                </div>
              </div>

              {/* Progress Bar (if audio track or timeline exists) */}
              {hasTimeline ? (
                <div className="space-y-1 pt-1">
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400">
                    <span>{currentFormatted}</span>
                    <span>{totalFormatted}</span>
                  </div>
                </div>
              ) : startTs ? (
                <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-0.5">
                  <span>ELAPSED:</span>
                  <span className="text-amber-300 font-black">{currentFormatted}</span>
                </div>
              ) : null}

              {/* Action Button (e.g. YouTube Music / Spotify / Hub) */}
              {actionUrl ? (
                <a
                  href={actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center py-2 px-3 bg-gradient-to-r from-rose-900/60 to-red-900/60 hover:from-rose-800 hover:to-red-800 text-white rounded-lg text-xs font-black uppercase tracking-wider border border-rose-700/40 shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                >
                  <span>{discord?.spotify ? 'Listen on Spotify' : 'Listen on YouTube Music'}</span>
                  <ExternalLink size={12} />
                </a>
              ) : null}
            </div>
          ) : (
            /* Standby Card when no active game/music */
            <div className="bg-[#1f090e] border border-rose-950/60 rounded-xl p-3.5 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white font-bold">STATUS: READY // NO ACTIVE SESSION</span>
              </span>
              <span className="text-[10px] text-zinc-500">IDLE</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
