import { getCurrentAnime } from "@/lib/anilist";
import { getRecentGames } from "@/lib/steam";
import { BookOpen, Gamepad2, User, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const animes = await getCurrentAnime("MehmetCanWT");
  const games = await getRecentGames("76561198200466026");

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Panel */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 manga-panel flex flex-col justify-center">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
            Mehmet<span className="bg-black text-white px-2">Can</span>WT
          </h1>
          <p className="mt-4 text-xl font-bold uppercase tracking-widest border-t-4 border-black pt-2">
            Manga Artist & Gaming Enthusiast // VDS Node 01
          </p>
        </div>
        <div className="manga-panel bg-black text-white flex flex-col items-center justify-center space-y-4">
          <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center">
            <User size={48} />
          </div>
          <div className="text-center">
            <p className="font-black italic text-2xl uppercase">Status</p>
            <p className="font-bold text-green-400 animate-pulse uppercase tracking-tighter">Online & Active</p>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Anime Section */}
        <section className="md:col-span-7 space-y-6">
          <div className="manga-title text-2xl flex items-center gap-2">
            <BookOpen size={24} /> Currently Watching
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {animes.length > 0 ? (
              animes.map((anime) => (
                <div key={anime.id} className="manga-panel group overflow-hidden">
                  <div className="relative aspect-[3/4] mb-4 border-2 border-black overflow-hidden">
                    <img 
                      src={anime.coverImage.large} 
                      alt={anime.title.english || anime.title.romaji}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                    />
                    <div className="absolute top-0 right-0 bg-black text-white p-1 text-xs font-bold">
                      {anime.averageScore}%
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
              ))
            ) : (
              <div className="manga-panel col-span-2 text-center py-10 grayscale opacity-50">
                <p className="font-black text-2xl">NO MANGA DATA FOUND</p>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar / Games & Tools */}
        <aside className="md:col-span-5 space-y-8">
          
          {/* Games Section */}
          <div className="space-y-4">
            <div className="manga-title text-2xl flex items-center gap-2">
              <Gamepad2 size={24} /> Recent Missions
            </div>
            <div className="space-y-3">
              {games.map((game) => (
                <div key={game.appid} className="manga-panel flex items-center gap-4 py-3">
                  <div className="w-12 h-12 bg-black flex-shrink-0 flex items-center justify-center text-white">
                    <Zap size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black uppercase text-sm leading-none mb-1">{game.name}</p>
                    <p className="text-xs font-bold text-gray-600">
                      {(game.playtime_forever / 60).toFixed(1)}H TOTAL
                    </p>
                  </div>
                  {game.playtime_2weeks && (
                    <div className="text-[10px] font-black bg-black text-white p-1">
                      ACTIVE
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Panel */}
          <div className="manga-panel bg-zinc-100 halftone relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="font-black uppercase text-xl mb-4 italic">System Logs</h4>
               <ul className="space-y-2 text-xs font-bold uppercase">
                 <li className="flex justify-between border-b border-black pb-1">
                   <span>Platform:</span>
                   <span>VDS Ubuntu</span>
                 </li>
                 <li className="flex justify-between border-b border-black pb-1">
                   <span>Framework:</span>
                   <span>Next.js 15</span>
                 </li>
                 <li className="flex justify-between border-b border-black pb-1">
                   <span>Port:</span>
                   <span>3131</span>
                 </li>
                 <li className="flex justify-between border-b border-black pb-1">
                   <span>Status:</span>
                   <span className="text-green-600">Operational</span>
                 </li>
               </ul>
             </div>
          </div>

        </aside>
      </div>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full h-12 bg-black border-t-4 border-black flex items-center justify-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-[scroll_20s_linear_infinite] text-white font-black italic tracking-tighter text-2xl uppercase">
          {Array(10).fill("MEHMETCANWT // MANGA SYSTEM // GAMING MODE // VDS ONLINE // ").map((t, i) => (
            <span key={i} className="mx-4">{t}</span>
          ))}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
