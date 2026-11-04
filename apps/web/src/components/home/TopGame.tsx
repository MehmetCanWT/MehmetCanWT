import { Gamepad2, Trophy, Clock, ExternalLink } from 'lucide-react';
import type { SteamGame } from '../../types';

interface TopGameProps {
  game?: SteamGame | null;
}

export default function TopGame({ game }: TopGameProps) {
  if (!game) {
    return (
      <section className="flex flex-col h-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
            <Gamepad2 size={20} className="text-amber-500" />
            <span>TOP MISSION</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
            <Trophy size={11} /> MASTERED
          </span>
        </div>
        <div className="manga-panel relative overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)] flex-1 flex flex-col justify-between animate-pulse">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-1">
            <div className="w-full sm:w-1/2 aspect-video rounded bg-zinc-200 dark:bg-zinc-800 border-2 border-dashed border-zinc-400 dark:border-zinc-700 shrink-0" />
            <div className="space-y-3 flex-1 w-full">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const hours = Math.round(game.playtime_forever / 60);

  return (
    <section className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
          <Gamepad2 size={20} className="text-amber-500" />
          <span>TOP MISSION</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
          <Trophy size={11} /> MASTERED
        </span>
      </div>

      <div className="manga-panel relative group overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)] transition-all flex-1 flex flex-col justify-between">
        <div className="relative z-10 flex flex-col justify-between h-full gap-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            {/* Vibrant Full-Color Game Header Image (NO GRAYSCALE) */}
            <div className="w-full sm:w-1/2 aspect-video border-3 border-black dark:border-white/30 overflow-hidden bg-zinc-950 shrink-0 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <img
                loading="lazy"
                referrerPolicy="no-referrer"
                src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.dataset.fallbackStep) {
                    target.dataset.fallbackStep = '1';
                    target.src = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/capsule_616x353.jpg`;
                  } else if (target.dataset.fallbackStep === '1') {
                    target.dataset.fallbackStep = '2';
                    target.src = game.img_icon_url || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/capsule_184x69.jpg`;
                  }
                }}
              />
              <div className="absolute bottom-1 right-1 bg-black/85 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 border border-zinc-700">
                APP {game.appid}
              </div>
            </div>

            {/* Playtime stats */}
            <div className="text-left sm:text-right flex-1 w-full border-b-2 sm:border-b-0 border-zinc-200 dark:border-zinc-800 pb-2 sm:pb-0">
              <p className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none text-black dark:text-white font-mono">
                {hours.toLocaleString()}H
              </p>
              <p className="font-bold uppercase text-[10px] text-zinc-500 flex items-center gap-1 sm:justify-end mt-1">
                <Clock size={11} /> Total Operation Time
              </p>
            </div>
          </div>

          <div className="mt-auto pt-3 border-t-2 border-dashed border-zinc-300 dark:border-zinc-800">
            <h3 className="text-2xl sm:text-3xl font-black uppercase italic leading-none line-clamp-1">
              {game.name}
            </h3>
            <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase">
              <span className="text-emerald-500 flex items-center gap-1 font-mono text-[11px] font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                VERIFIED MISSION RECORD
              </span>
              <a
                href={`https://steamcommunity.com/app/${game.appid}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors underline font-black text-[11px]"
              >
                <span>COMMUNITY HUB</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
