import { getAllAnime, getAnimeById } from "@/lib/anilist";
import { getAllGames } from "@/lib/steam";
import { BookOpen, Gamepad2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const favoriteAnime = await getAnimeById(21);
  const allGames = await getAllGames("76561198200466026");
  
  const topGame = [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Panel */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 manga-panel flex flex-col justify-center">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
            Mehmet<span className="bg-black text-white px-2">Can</span>WT
          </h1>
          <p className="mt-4 text-xl font-bold uppercase tracking-widest border-t-4 border-black pt-2">
            Personal Terminal // Node 01
          </p>
        </div>
        <nav className="manga-panel bg-black text-white flex flex-col items-center justify-center space-y-4">
           <Link href="/anime" className="text-2xl font-black italic uppercase hover:text-purple-400 transition-colors flex items-center gap-2 w-full justify-center border-b border-white pb-2">
             <BookOpen /> Anime List
           </Link>
           <Link href="/games" className="text-2xl font-black italic uppercase hover:text-pink-400 transition-colors flex items-center gap-2 w-full justify-center">
             <Gamepad2 /> Game Vault
           </Link>
        </nav>
      </header>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Favorite Anime Highlight */}
        <section className="space-y-4">
          <div className="manga-title text-2xl">FAVORITE SELECTION</div>
          {favoriteAnime ? (
            <div className="manga-panel relative group overflow-hidden bg-zinc-100 min-h-[300px]">
              <div className="absolute inset-0 halftone opacity-20"></div>
              <div className="relative z-10 flex gap-6 h-full">
                <div className="w-1/3 aspect-[3/4] border-4 border-black overflow-hidden flex-shrink-0">
                  <img 
                    src={favoriteAnime.coverImage.large} 
                    alt={favoriteAnime.title.english}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-4xl font-black uppercase leading-tight italic">{favoriteAnime.title.english || favoriteAnime.title.romaji}</h3>
                    <p className="mt-2 font-bold text-gray-600 uppercase tracking-tighter">Ultimate Favorited</p>
                  </div>
                  <Link href="/anime" className="mt-4 inline-flex items-center gap-2 font-black uppercase bg-black text-white px-4 py-2 self-start hover:bg-gray-800 transition-colors">
                    View Full List <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 text-8xl font-black text-black/5 select-none pointer-events-none uppercase">
                ONE PIECE
              </div>
            </div>
          ) : (
            <div className="manga-panel">Loading Favorite Anime...</div>
          )}
        </section>

        {/* Top Game Highlight */}
        <section className="space-y-4">
          <div className="manga-title text-2xl">MOST PLAYED MISSION</div>
          {topGame ? (
            <div className="manga-panel relative group overflow-hidden bg-zinc-100 min-h-[300px]">
              <div className="absolute inset-0 halftone opacity-20"></div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div className="w-20 h-20 bg-black flex items-center justify-center text-white shrink-0">
                    <Zap size={40} />
                  </div>
                  <div className="text-right">
                    <p className="text-6xl font-black italic tracking-tighter">{(topGame.playtime_forever / 60).toFixed(0)}H</p>
                    <p className="font-bold uppercase text-xs">Total Playtime</p>
                  </div>
                </div>
                <div className="mt-8 border-t-4 border-black pt-4">
                   <h3 className="text-4xl font-black uppercase italic leading-none">{topGame.name}</h3>
                   <div className="mt-4 flex justify-between items-end">
                      <p className="font-bold text-gray-600 uppercase tracking-widest">Active Status: Operational</p>
                      <Link href="/games" className="inline-flex items-center gap-2 font-black uppercase bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors">
                        Game Hub <ArrowRight size={18} />
                      </Link>
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-10 text-8xl font-black text-black/5 select-none pointer-events-none uppercase">
                TOP
              </div>
            </div>
          ) : (
            <div className="manga-panel">Loading Top Game...</div>
          )}
        </section>

      </div>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full h-12 bg-black border-t-4 border-black flex items-center justify-center overflow-hidden">
        <div className="flex whitespace-nowrap animate-manga-scroll text-white font-black italic tracking-tighter text-2xl uppercase">
          {Array(10).fill("MEHMETCANWT // MANGA SYSTEM // GAMING MODE // VDS ONLINE // ").map((t, i) => (
            <span key={i} className="mx-4">{t}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
