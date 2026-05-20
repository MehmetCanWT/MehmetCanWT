import { useEffect, useState } from 'react';
import { Gamepad2, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/eden';
import SEO from '../components/SEO';
import type { SteamGame, GamesResponse } from '../types';

interface GamesPageData {
  allGames: SteamGame[];
  pinnedIds: number[];
}

export default function Games() {
  const [data, setData] = useState<GamesPageData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.api.games.get();
        if (res.data) {
          const responseData = res.data as GamesResponse;
          const sorted = [...responseData.allGames].sort((a, b) => {
            const isPinnedA = responseData.pinnedIds.includes(a.appid);
            const isPinnedB = responseData.pinnedIds.includes(b.appid);
            if (isPinnedA && !isPinnedB) return -1;
            if (!isPinnedA && isPinnedB) return 1;
            return b.playtime_forever - a.playtime_forever;
          });
          setData({ allGames: sorted, pinnedIds: responseData.pinnedIds });
        }
      } catch (e) {
        console.error('Failed to fetch games data:', e);
        setError('Failed to load game vault. Please try again.');
      }
    }
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="font-black uppercase italic text-2xl text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="manga-panel font-black uppercase hover:bg-black hover:text-white transition-all">RETRY</button>
      </div>
    );
  }

  if (!data) return <div className="p-20 text-center font-black uppercase text-4xl italic animate-pulse">Accessing Vault...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SEO title="Game Vault // MehmetCanWT" description="Personal gaming library and playtimes." url="https://mehmetcanwt.xyz/games" />
      <header className="flex justify-between items-center">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
          <Gamepad2 size={28} /> Mission Archives
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.allGames.map((game) => (
          <div key={game.appid} className={`manga-panel relative group overflow-hidden ${data.pinnedIds.includes(game.appid) ? "ring-4 ring-pink-600 bg-pink-50 dark:bg-pink-950" : "bg-zinc-50 dark:bg-zinc-800"}`}>
            <div className="relative z-10 flex flex-col h-full">
              <div className="relative aspect-video border-2 border-black dark:border-white/20 mb-4 overflow-hidden bg-black">
                <img 
                  loading="lazy"
                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                  alt={game.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                {data.pinnedIds.includes(game.appid) && (
                  <div className="absolute top-2 left-2 bg-pink-600 text-white p-1">
                    <Star size={16} fill="white" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="text-right w-full">
                  <p className="text-4xl font-black italic tracking-tighter leading-none">
                    {(game.playtime_forever / 60).toFixed(1)}H
                  </p>
                  <p className="font-bold text-[10px] uppercase text-gray-500">Total Operation Time</p>
                </div>
              </div>
              
              <div className="mt-auto border-t-2 border-black dark:border-white/20 pt-4">
                <h3 className="font-black text-2xl uppercase italic leading-tight mb-2 line-clamp-1">{game.name}</h3>
                <div className="flex justify-between items-center font-bold text-xs uppercase">
                  <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5">ID: {game.appid}</span>
                  {game.playtime_2weeks ? (
                    <span className="text-green-600 animate-pulse font-black">● ACTIVE</span>
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
