import { Tv, Star, Heart } from 'lucide-react';
import type { AnimeEntry } from '../../types';

interface FavoriteAnimeProps {
  anime: AnimeEntry;
}

export default function FavoriteAnime({ anime }: FavoriteAnimeProps) {
  const stars = Math.min(10, Math.max(1, Math.round((anime.userScore || 100) / 10)));

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

      <div className="manga-panel relative group overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-5 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all flex-1 flex flex-col justify-between">
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start flex-1">
          {/* Vibrant Full-Color Cover (NO GRAYSCALE) */}
          <div className="w-32 sm:w-36 aspect-[3/4] border-3 border-black dark:border-white/30 overflow-hidden flex-shrink-0 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-zinc-950">
            <img
              src={anime.coverImage.large}
              alt={anime.title.english || "Favorite Anime"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-1 left-1 bg-black/90 text-yellow-400 text-[10px] font-black px-1.5 py-0.5 border border-yellow-400 flex items-center gap-1 shadow-sm">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              <span>{stars}/10</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between w-full h-full py-0.5">
            <div className="space-y-2">
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
              <span className="text-zinc-500 font-mono">PROGRESS:</span>
              <span className="bg-yellow-400 text-black px-2.5 py-0.5 border border-black font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {anime.progress || 1100}+ EPISODES
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
