"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Star, StarOff, Search } from "lucide-react";
import Link from "next/link";

export default function AdminGames() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pins, setPins] = useState<number[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [gameRes, pinRes] = await Promise.all([
        fetch("/api/games-all"),
        fetch("/api/admin/pins?type=game")
      ]);
      const gameData = await gameRes.json();
      const pinData = await pinRes.json();
      setGames(gameData);
      setPins(pinData.pins);
      setLoading(false);
    }
    fetchData();
  }, []);

  const togglePin = async (id: number, title: string) => {
    const isPinned = !pins.includes(id);
    if (isPinned) setPins([...pins, id]);
    else setPins(pins.filter(p => p !== id));

    await fetch("/api/admin/pin-game", {
      method: "POST",
      body: JSON.stringify({ id, isPinned, title }),
    });
  };

  const filtered = games.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center font-black uppercase text-4xl italic animate-pulse">Accessing Vault...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link href="/admin" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="flex-1 w-full max-w-md relative">
          <input 
            type="text" 
            placeholder="Search Games..." 
            className="w-full border-4 border-black p-3 font-black uppercase pl-12 focus:bg-zinc-50 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-black" size={20} />
        </div>
        <div className="manga-title text-3xl italic uppercase">Manage Games</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((game) => (
          <div key={game.appid} className={`manga-panel relative group ${pins.includes(game.appid) ? "border-pink-600 bg-pink-50" : ""}`}>
            <button 
              onClick={() => togglePin(game.appid, game.name)}
              className="absolute top-2 left-2 z-20 bg-white border-2 border-black p-1 hover:scale-110 transition-transform"
            >
              {pins.includes(game.appid) ? <Star className="text-pink-600 fill-pink-600" size={20} /> : <StarOff size={20} />}
            </button>
            <div className="aspect-video border-2 border-black overflow-hidden mb-2 bg-black">
               <img 
                 src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`} 
                 className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                 alt="" 
               />
            </div>
            <h3 className="font-black uppercase text-sm line-clamp-2 leading-tight">{game.name}</h3>
            <p className="text-[10px] font-bold mt-1 opacity-50 uppercase">APPID: {game.appid} // {(game.playtime_forever / 60).toFixed(0)}H</p>
          </div>
        ))}
      </div>
    </div>
  );
}
