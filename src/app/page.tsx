import { getAllAnime, getAnimeById } from "@/lib/anilist";
import { getAllGames } from "@/lib/steam";
import { getMixedNews } from "@/lib/news";
import { BookOpen, Gamepad2, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [favoriteAnime, allGames, news] = await Promise.all([
    getAnimeById(21),
    getAllGames("76561198200466026"),
    getMixedNews()
  ]);
  
  const topGame = [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
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
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
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
                <div className="flex items-start justify-between gap-4">
                  <div className="w-1/2 aspect-video border-4 border-black overflow-hidden bg-black shrink-0">
                    <img 
                      src={`https://cdn.akamai.steamstatic.com/steam/apps/${topGame.appid}/header.jpg`} 
                      alt={topGame.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-5xl font-black italic tracking-tighter leading-none">{(topGame.playtime_forever / 60).toFixed(0)}H</p>
                    <p className="font-bold uppercase text-xs">Total Playtime</p>
                  </div>
                </div>
                <div className="mt-4 border-t-4 border-black pt-4">
                   <h3 className="text-4xl font-black uppercase italic leading-none line-clamp-1">{topGame.name}</h3>
                   <div className="mt-4 flex justify-between items-end">
                      <p className="font-bold text-gray-600 uppercase tracking-widest">Status: Mastered</p>
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

      {/* Breaking News Ticker */}
      <footer className="fixed bottom-0 left-0 w-full bg-black border-t-4 border-black h-16 flex items-center overflow-hidden z-50">
        <div className="bg-red-600 text-white font-black italic px-4 py-full h-full flex items-center shrink-0 z-10 border-r-4 border-black shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]">
          BREAKING NEWS
        </div>
        <div className="flex whitespace-nowrap animate-manga-scroll text-white font-bold tracking-tight text-xl uppercase items-center">
          {news.map((item, i) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span className="text-red-500 font-black">●</span>
              {item.title} 
              <span className="text-xs bg-white text-black px-1 font-black ml-2">[{item.source}]</span>
            </span>
          ))}
          {/* Loop for infinite feel */}
          {news.map((item, i) => (
            <span key={`loop-${i}`} className="mx-8 flex items-center gap-2">
              <span className="text-red-500 font-black">●</span>
              {item.title} 
              <span className="text-xs bg-white text-black px-1 font-black ml-2">[{item.source}]</span>
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
