import { useEffect, useState } from 'react';
import { ArrowLeft, Star, StarOff, Search } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { apiGet, apiPost } from '../../lib/api';
import type { GamesResponse } from '../../types';

export default function AdminGames() {
  const { isAuth } = useStore();
  const [data, setData] = useState<GamesResponse | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiGet<GamesResponse>('/api/games');
        if (res) setData(res);
      } catch (e) {
        setError('Failed to load games data.');
      }
    }
    if (isAuth) fetchData();
  }, [isAuth]);

  const togglePin = async (id: number, title: string) => {
    if (!data) return;
    const isPinned = !data.pinnedIds.includes(id);
    
    // Optimistic update with rollback
    const prevPinned = data.pinnedIds;
    const newPinned = isPinned 
      ? [...data.pinnedIds, id]
      : data.pinnedIds.filter((p) => p !== id);
    
    setData({ ...data, pinnedIds: newPinned });

    try {
      await apiPost('/api/admin/pin-game', { id, isPinned, title });
    } catch (e) {
      // Rollback on failure
      setData({ ...data, pinnedIds: prevPinned });
      console.error('Failed to toggle pin:', e);
    }
  };

  if (!isAuth) return <Navigate to="/admin" />;
  if (error) return <div className="p-20 text-center font-black uppercase text-2xl text-red-600">{error}</div>;
  if (!data) return <div className="p-20 text-center font-black uppercase text-4xl italic animate-pulse">Accessing Vault...</div>;

  const filtered = data.allGames.filter((g) => 
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link to="/admin" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="flex-1 w-full max-w-md relative">
          <label htmlFor="games-search" className="sr-only">Search games</label>
          <input 
            id="games-search"
            type="text" 
            placeholder="Search Games..." 
            className="w-full border-4 border-black dark:border-white/20 p-3 font-black uppercase pl-12 focus:bg-zinc-50 dark:focus:bg-zinc-800 outline-none bg-white dark:bg-zinc-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-black dark:text-white" size={20} />
        </div>
        <div className="manga-title text-3xl italic uppercase">Manage Games</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((game) => (
          <div key={game.appid} className={`manga-panel relative group ${data.pinnedIds.includes(game.appid) ? "border-pink-600 bg-pink-50 dark:bg-pink-950" : ""}`}>
            <button 
              onClick={() => togglePin(game.appid, game.name)}
              className="absolute top-2 left-2 z-20 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/20 p-1 hover:scale-110 transition-transform"
              aria-label={data.pinnedIds.includes(game.appid) ? "Unpin game" : "Pin game"}
            >
              {data.pinnedIds.includes(game.appid) ? <Star className="text-pink-600 fill-pink-600" size={20} /> : <StarOff size={20} />}
            </button>
            <div className="aspect-video border-2 border-black dark:border-white/20 overflow-hidden mb-2 bg-black">
               <img src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={game.name} loading="lazy" />
            </div>
            <h3 className="font-black uppercase text-sm line-clamp-2 leading-tight">{game.name}</h3>
            <p className="text-[10px] font-bold mt-1 opacity-50 uppercase">APPID: {game.appid} // {(game.playtime_forever / 60).toFixed(0)}H</p>
          </div>
        ))}
      </div>
    </div>
  );
}
