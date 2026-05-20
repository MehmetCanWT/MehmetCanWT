import type { SteamGame } from '../../types';

interface TopGameProps {
  game: SteamGame;
}

export default function TopGame({ game }: TopGameProps) {
  return (
    <section className="space-y-4">
      <div className="manga-title text-xl sm:text-2xl">MOST PLAYED MISSION</div>
      <div className="manga-panel relative group overflow-hidden bg-zinc-100 dark:bg-zinc-800 min-h-[250px] sm:min-h-[300px] block cursor-default outline-none">
        <div className="absolute inset-0 halftone opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="w-full sm:w-1/2 aspect-video border-4 border-black dark:border-white/20 overflow-hidden bg-black shrink-0 relative">
              <img
                loading="lazy"
                src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                alt={game.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="text-left sm:text-right flex-1 w-full border-b-4 sm:border-b-0 border-black dark:border-white/20 pb-2 sm:pb-0">
              <p className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none">{(game.playtime_forever / 60).toFixed(0)}H</p>
              <p className="font-bold uppercase text-xs">Total Playtime</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:border-t-4 border-black dark:border-white/20 pt-4">
             <h3 className="text-3xl sm:text-4xl font-black uppercase italic leading-none line-clamp-1">{game.name}</h3>
             <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <p className="font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-xs sm:text-sm">Status: Mastered</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-10 text-6xl sm:text-8xl font-black text-black/5 dark:text-white/5 select-none pointer-events-none uppercase whitespace-nowrap overflow-hidden max-w-full text-ellipsis">
          {game.name}
        </div>
      </div>
    </section>
  );
}
