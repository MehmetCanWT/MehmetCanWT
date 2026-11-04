import { Gamepad2, Trophy, Clock, ExternalLink } from 'lucide-react';
import type { SteamGame } from '../../types';

interface TopGameProps {
  game: SteamGame;
}

export default function TopGame({ game }: TopGameProps) {
  const hours = Math.round(game.playtime_forever / 60);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
          <Gamepad2 size={20} className="text-amber-500" />
          <span>TOP MISSION</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
          <Trophy size={11} /> MASTERED
        </span>
      </div>

      <div className="manga-panel relative group overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all">
        <div className="relative z-10 flex flex-col justify-between h-full gap-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            {/* Vibrant Full-Color Game Header Image (NO GRAYSCALE) */}
            <div className="w-full sm:w-1/2 aspect-video border-3 border-black dark:border-white/30 overflow-hidden bg-zinc-950 shrink-0 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <img
                loading="lazy"
                src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 border border-zinc-700">
                APP {game.appid}
              </div>
            </div>

            {/* Playtime stats */}
            <div className="text-left sm:text-right flex-1 w-full border-b-2 sm:border-b-0 border-zinc-200 dark:border-zinc-800 pb-2 sm:pb-0">
              <p className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none text-black dark:text-white">
                {hours.toLocaleString()}H
              </p>
              <p className="font-bold uppercase text-[10px] text-zinc-500 flex items-center gap-1 sm:justify-end mt-1">
                <Clock size={11} /> Total Operation Time
              </p>
            </div>
          </div>

          <div className="pt-2 border-t-2 border-dashed border-zinc-300 dark:border-zinc-800">
            <h3 className="text-2xl sm:text-3xl font-black uppercase italic leading-none line-clamp-1">
              {game.name}
            </h3>
            <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase">
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Verified Mission Record
              </span>
              <a
                href={`https://steamcommunity.com/app/${game.appid}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors underline"
              >
                <span>HUB</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
