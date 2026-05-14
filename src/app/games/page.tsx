import { getAllGames } from "@/lib/steam";
import { getPinnedGameIds } from "@/lib/prisma";
import { Gamepad2, ArrowLeft, Zap, Trophy, Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const [games, pinnedIds] = await Promise.all([
    getAllGames("76561198200466026"),
    getPinnedGameIds()
  ]);
  
  // Sort: Pinned first, then by playtime
  const sortedGames = [...games].sort((a, b) => {
    const isPinnedA = pinnedIds.includes(a.appid);
    const isPinnedB = pinnedIds.includes(b.appid);
    
    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;
    
    return b.playtime_forever - a.playtime_forever;
  });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <Link href="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
          <Gamepad2 size={28} /> Mission Archives
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGames.map((game) => (
          <div key={game.appid} className={`manga-panel relative group overflow-hidden ${pinnedIds.includes(game.appid) ? "ring-4 ring-pink-600 bg-pink-50" : "bg-zinc-50"}`}>
            <div className="absolute top-2 right-2 opacity-10">
              {pinnedIds.includes(game.appid) ? <Star size={80} fill="currentColor" className="text-pink-600" /> : <Trophy size={80} />}
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-black text-white flex items-center justify-center border-2 border-black">
                  <Zap size={28} />
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black italic tracking-tighter leading-none">
                    {(game.playtime_forever / 60).toFixed(1)}H
                  </p>
                  <p className="font-bold text-[10px] uppercase text-gray-500">Total Operation Time</p>
                </div>
              </div>
              
              <div className="mt-auto border-t-2 border-black pt-4">
                <h3 className="font-black text-2xl uppercase italic leading-tight mb-2">{game.name}</h3>
                <div className="flex justify-between items-center font-bold text-xs uppercase">
                  <span className="bg-black text-white px-2 py-0.5">ID: {game.appid}</span>
                  {game.playtime_2weeks ? (
                    <span className="text-green-600 animate-pulse font-black">● ACTIVE MISSION</span>
                  ) : (
                    <span className="text-gray-400 italic">ARCHIVED</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
