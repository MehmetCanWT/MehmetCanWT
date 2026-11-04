import { Tv, Star, Heart } from 'lucide-react';
import type { AnimeEntry } from '../../types';

interface FavoriteAnimeProps {
  anime?: AnimeEntry | null;
}

export default function FavoriteAnime({ anime }: FavoriteAnimeProps) {
  if (!anime) {
    return (
      <section className="flex flex-col h-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
            <Heart size={20} className="fill-rose-500 text-rose-500" />
            <span>FAVORITE ANIME</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            TOP PICK
          </span>
        </div>
        <div className="manga-panel relative overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)] flex-1 flex flex-col justify-between animate-pulse">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-1">
            <div className="w-36 sm:w-44 aspect-[3/4] rounded bg-zinc-200 dark:bg-zinc-800 border-2 border-dashed border-zinc-400 dark:border-zinc-700 shrink-0" />
            <div className="space-y-3 flex-1 w-full">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const rawScore = typeof anime.userScore === 'number' && anime.userScore > 0 ? anime.userScore : 5;
  const stars = rawScore <= 5 ? rawScore : Math.min(5, Math.max(1, Math.round(rawScore / 20)));

  return (
    <section className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
          <Heart size={20} className="fill-rose-500 text-rose-500" />
          <span>FAVORITE ANIME</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-rose-500 text-white px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          TOP PICK
        </span>
      </div>

      <div className="manga-panel relative group overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)] transition-all flex-1 flex flex-col justify-between">
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center sm:items-start flex-1">
          {/* Vibrant Full-Color Cover */}
          <div className="w-36 sm:w-44 aspect-[3/4] border-3 border-black dark:border-white/30 overflow-hidden shrink-0 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-zinc-950">
            <img
              src={anime.coverImage.large}
              alt={anime.title.english || "Favorite Anime"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-1.5 left-1.5 bg-black/90 text-yellow-400 text-xs font-black px-2 py-0.5 border border-yellow-400 flex items-center gap-1 shadow-sm font-mono">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span>{stars}/5</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between w-full h-full py-0.5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                  <Tv size={11} /> {anime.format || 'TV'}
                </span>
                <span className="text-[10px] font-black bg-emerald-500 text-black px-2 py-0.5 uppercase tracking-wider">
                  {anime.status || 'CURRENT'}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase leading-tight italic tracking-tight line-clamp-2">
                {anime.title.english || anime.title.romaji}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium line-clamp-3 leading-relaxed">
                {anime.description?.replace(/<[^>]*>/g, '') || 'Monkey D. Luffy sets out with his pirate crew into the treacherous Grand Line to find the legendary treasure One Piece.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-dashed border-zinc-300 dark:border-zinc-800 flex justify-between items-center text-xs font-black uppercase">
              <span className="text-zinc-500 font-mono text-[11px]">PROGRESS:</span>
              <span className="bg-amber-400 text-black px-2 py-0.5 border border-black font-mono rounded-sm text-[11px] font-bold tracking-tight">
                {anime.progress || 1100}+ EPISODES
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
