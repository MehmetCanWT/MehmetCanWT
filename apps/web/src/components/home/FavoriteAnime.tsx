import type { AnimeEntry } from '../../types';

interface FavoriteAnimeProps {
  anime: AnimeEntry;
}

export default function FavoriteAnime({ anime }: FavoriteAnimeProps) {
  return (
    <section className="space-y-4">
      <div className="manga-title text-xl sm:text-2xl">FAVORITE SELECTION</div>
      <div className="manga-panel relative group overflow-hidden bg-white text-black dark:bg-zinc-800 dark:text-white min-h-[250px] sm:min-h-[300px] block cursor-default outline-none">
        <div className="absolute inset-0 halftone opacity-10 dark:opacity-20"></div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 h-full">
          <div className="w-full sm:w-1/3 aspect-[3/4] border-4 border-black dark:border-white/20 overflow-hidden flex-shrink-0 relative">
            <img
              src={anime.coverImage.large}
              alt={anime.title.english || "Favorite Anime"}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div>
              <h3 className="text-3xl sm:text-4xl font-black uppercase leading-tight italic line-clamp-2">{anime.title.english || anime.title.romaji}</h3>
              <p className="mt-2 font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter text-sm">Ultimate Favorited Selection</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 text-6xl sm:text-8xl font-black text-black/5 dark:text-white/5 select-none pointer-events-none uppercase whitespace-nowrap overflow-hidden max-w-full text-ellipsis">
          {anime.title.english || anime.title.romaji}
        </div>
      </div>
    </section>
  );
}
