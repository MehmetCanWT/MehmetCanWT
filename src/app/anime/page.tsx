import { getAllAnime } from "@/lib/anilist";
import { getPinnedAnimeIds } from "@/lib/prisma";
import { BookOpen, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnimePage() {
  const [animes, pinnedIds] = await Promise.all([
    getAllAnime("MehmetCanWT"),
    getPinnedAnimeIds()
  ]);

  // Merge pins and sort: Pinned first, then default status/score sort
  const sorted = [...animes].sort((a, b) => {
    const isPinnedA = pinnedIds.includes(a.id);
    const isPinnedB = pinnedIds.includes(b.id);
    
    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;
    
    return 0; // Already sorted by status/score in getAllAnime
  });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <Link href="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
          <BookOpen size={28} /> Anime Archive
        </div>
      </header>

      {/* Filter Legend */}
      <div className="flex gap-2 flex-wrap">
         <div className="bg-black text-white px-3 py-1 text-xs font-black uppercase italic">All Statuses</div>
         <div className="border-2 border-black px-3 py-1 text-xs font-bold uppercase">Watching</div>
         <div className="border-2 border-black px-3 py-1 text-xs font-bold uppercase opacity-50">Completed</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sorted.map((anime) => (
          <div key={anime.id} className={`manga-panel group overflow-hidden ${pinnedIds.includes(anime.id) ? "ring-4 ring-purple-600" : ""}`}>
            <div className="relative aspect-[3/4] mb-4 border-2 border-black overflow-hidden bg-zinc-100">
              <img 
                src={anime.coverImage.large} 
                alt={anime.title.english || anime.title.romaji}
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
              />
              {pinnedIds.includes(anime.id) && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white p-1">
                  <Star size={16} fill="white" />
                </div>
              )}
              <div className="absolute top-0 right-0 bg-black text-white p-1 text-xs font-bold">
                {anime.userScore > 0 ? `${anime.userScore}%` : `${anime.averageScore}%`}
              </div>
            </div>
            <h3 className="font-black text-lg leading-tight uppercase line-clamp-2 min-h-[3rem]">
              {anime.title.english || anime.title.romaji}
            </h3>
            <div className="mt-2 flex justify-between items-center font-bold text-sm border-t-2 border-black pt-2">
              <span>EP {anime.progress}</span>
              <span className="uppercase text-[10px] bg-black text-white px-1">{anime.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
