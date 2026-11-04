import { useState, useEffect } from 'react';
import { Radio, ExternalLink, MoreHorizontal, Sparkles } from 'lucide-react';
import type { DiscordData, DiscordActivity } from '../../types';

interface DiscordPresenceProps {
  discord: DiscordData | null;
}

function resolveAssetUrl(activity?: DiscordActivity): string | null {
  if (!activity?.assets?.large_image) return null;
  const raw = activity.assets.large_image;
  if (raw.startsWith('mp:external/')) {
    return raw.replace(/^mp:external\/[^\/]+\/https?\//, 'https://');
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

  const mainActivity =
    discord?.activities?.find((a) => a.type === 2 || a.name === 'BitChord') ||
    (discord?.spotify
      ? {
          type: 2,
          name: 'Spotify',
          details: discord.spotify.song,
          state: discord.spotify.artist,
          assets: { large_image: discord.spotify.album_art_url },
        }
      : null) ||
    discord?.activities?.find((a) => a.type !== 4);

  const activityImage =
    resolveAssetUrl(mainActivity as DiscordActivity | undefined) ||
    'https://yt3.googleusercontent.com/Twb6bd5hcKvQLpTJ0FbxqxdRDSs4dpimhPkiZvF9uHZQ6pR02F6HefN0X4lLwgBdFhEbzB6UMaQn5fo=w544-h544-l90-rj';

  // Calculate audio track progress
  const startTs = mainActivity?.timestamps?.start;
  const endTs = mainActivity?.timestamps?.end;
  let progressPercent = 75;
  let currentFormatted = '03:11';
  let totalFormatted = '03:36';

  if (startTs && endTs && endTs > startTs) {
    const elapsed = Math.max(0, now - startTs);
    const total = endTs - startTs;
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    currentFormatted = formatDuration(elapsed);
    totalFormatted = formatDuration(total);
  }

  const musicUrl =
    mainActivity?.details_url ||
    (mainActivity?.details
      ? `https://music.youtube.com/search?q=${encodeURIComponent(
          `${mainActivity.details} ${mainActivity.state || ''}`
        )}`
      : 'https://music.youtube.com');

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

      {/* Discord Profile Card (Pixel-perfect recreation of user screenshot) */}
      <div className="manga-panel relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#22070c] via-[#180509] to-[#0f0305] text-white border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)]">
        {/* Banner with Fiery Demon / Rose Theme */}
        <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-red-950 via-rose-900 to-amber-950">
          <img
            src="/discord-banner.png"
            alt="Discord Banner"
            className="w-full h-full object-cover object-top opacity-95"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#22070c] via-transparent to-black/20" />
        </div>

        {/* Content body */}
        <div className="px-5 pb-5 pt-0 space-y-4 relative">
          {/* Avatar row with avatar decoration & custom status emoji bubble */}
          <div className="flex items-end justify-between -mt-12 mb-2">
            <div className="relative inline-block">
              {/* Avatar Image */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#22070c] shadow-lg bg-zinc-950 relative">
                <img
                  src={avatarUrl}
                  alt={user?.username || 'MehmetCan'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Wings Avatar Decoration Preset */}
              <img
                src={avatarDecorationUrl}
                alt="Avatar Decoration"
                className="absolute -top-3.5 -left-3.5 w-[135%] h-[135%] pointer-events-none scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />

              {/* Discord Online Indicator */}
              <div
                className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-[#22070c] ${statusColor} ${
                  isOnline ? 'animate-pulse' : ''
                }`}
              />
            </div>

            {/* Custom Status Speech Bubble */}
            <div className="bg-[#2d0e14] border border-rose-500/30 rounded-2xl px-3 py-1.5 shadow-md flex items-center gap-1.5 mb-2 hover:scale-105 transition-transform">
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
              <span className="inline-flex items-center gap-1 bg-cyan-950/80 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-500/40">
                💎 OPEN
              </span>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-2 pt-1 pb-1 text-sm bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 flex-wrap">
            <span title="Blender / 3D">🎨</span>
            <span title="Terminal / Systems">🖥️</span>
            <span title="Combat / CS2">⚔️</span>
            <span title="Gamer">🎮</span>
            <span title="Python / Backend">🐍</span>
            <span title="Diamond">💎</span>
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
              +2
            </span>
          </div>

          {/* Game Collection Preview Row (Oyun Koleksiyonu) */}
          <div className="bg-[#290c12]/70 border border-rose-950/60 rounded-xl p-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">Oyun Koleksiyonu</span>
            <div className="flex items-center gap-1.5">
              <img
                src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/capsule_sm_120.jpg"
                alt="CS2"
                title="Counter-Strike 2"
                className="w-6 h-6 rounded object-cover border border-zinc-700 hover:scale-110 transition-transform"
              />
              <img
                src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427520/capsule_sm_120.jpg"
                alt="Factorio"
                title="Factorio"
                className="w-6 h-6 rounded object-cover border border-zinc-700 hover:scale-110 transition-transform"
              />
              <img
                src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/capsule_sm_120.jpg"
                alt="ARK"
                title="ARK: Survival Evolved"
                className="w-6 h-6 rounded object-cover border border-zinc-700 hover:scale-110 transition-transform"
              />
              <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/80 px-1 py-0.5 rounded">
                +4
              </span>
            </div>
          </div>

          {/* Activity Player Card (BitChord / YouTube Music / Spotify) */}
          <div className="bg-[#260a10] border border-rose-900/40 rounded-xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-rose-400 animate-spin" />
                {mainActivity?.name ? `${mainActivity.name} dinliyor` : 'BitChord dinliyor'}
              </span>
              <MoreHorizontal size={14} className="text-zinc-500 cursor-pointer hover:text-white" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-rose-900/50 flex-shrink-0 bg-black shadow-md">
                <img
                  src={activityImage}
                  alt={mainActivity?.details || 'Ending Credits'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://yt3.googleusercontent.com/Twb6bd5hcKvQLpTJ0FbxqxdRDSs4dpimhPkiZvF9uHZQ6pR02F6HefN0X4lLwgBdFhEbzB6UMaQn5fo=w544-h544-l90-rj';
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-black text-sm text-white truncate leading-tight">
                  {mainActivity?.details || 'Ending Credits'}
                </h4>
                <p className="text-xs font-medium text-zinc-400 truncate mt-0.5">
                  {mainActivity?.state || 'Opeth'}
                </p>
              </div>
            </div>

            {/* Audio Timeline Scrub Bar */}
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

            {/* Listen on YouTube Music button */}
            <a
              href={musicUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full block text-center py-2 px-3 bg-gradient-to-r from-rose-900/60 to-red-900/60 hover:from-rose-800 hover:to-red-800 text-white rounded-lg text-xs font-black uppercase tracking-wider border border-rose-700/40 shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
            >
              <span>Listen on YouTube Music</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
