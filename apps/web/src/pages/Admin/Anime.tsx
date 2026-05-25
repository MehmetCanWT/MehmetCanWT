import { useEffect, useState } from 'react';
import { ArrowLeft, Star, StarOff, Search } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { apiGet, apiPost } from '../../lib/api';
import type { AnimeResponse } from '../../types';

export default function AdminAnime() {
  const { isAuth } = useStore();
  const [data, setData] = useState<AnimeResponse | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiGet<AnimeResponse>('/api/anime');
        if (res) setData(res);
      } catch (e) {
        setError('Failed to load anime data.');
      }
    }
    if (isAuth) fetchData();
  }, [isAuth]);

  const togglePin = async (id: number, title: string) => {
    if (!data) return;
    const isPinned = !data.pinnedIds.includes(id);
    
    // Optimistic update
    const prevPinned = data.pinnedIds;
    const newPinned = isPinned 
      ? [...data.pinnedIds, id]
      : data.pinnedIds.filter((p) => p !== id);
    
    setData({ ...data, pinnedIds: newPinned });

    try {
      await apiPost('/api/admin/pin-anime', { id, isPinned, title });
    } catch (e) {
      // Rollback on failure
      setData({ ...data, pinnedIds: prevPinned });
      console.error('Failed to toggle pin:', e);
    }
  };

  if (!isAuth) return <Navigate to="/admin" />;
  if (error) return <div className="p-20 text-center font-black uppercase text-2xl text-red-600">{error}</div>;
  if (!data) return <div className="p-20 text-center font-black uppercase text-4xl italic animate-pulse">Syncing...</div>;

  const filtered = data.allAnime.filter((a) => 
    (a.title.english || a.title.romaji).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link to="/admin" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="flex-1 w-full max-w-md relative">
          <label htmlFor="anime-search" className="sr-only">Search anime</label>
          <input 
            id="anime-search"
            type="text" 
            placeholder="Search Archive..." 
            className="w-full border-4 border-black dark:border-white/20 p-3 font-black uppercase pl-12 focus:bg-zinc-50 dark:focus:bg-zinc-800 outline-none bg-white dark:bg-zinc-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-black dark:text-white" size={20} />
        </div>
        <div className="manga-title text-3xl italic uppercase">Manage Anime</div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((anime) => (
          <div key={anime.id} className={`manga-panel relative group ${data.pinnedIds.includes(anime.id) ? "border-purple-600 bg-purple-50 dark:bg-purple-950" : ""}`}>
            <button 
              onClick={() => togglePin(anime.id, anime.title.english || anime.title.romaji)}
              className="absolute top-2 left-2 z-20 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white/20 p-1 hover:scale-110 transition-transform"
              aria-label={data.pinnedIds.includes(anime.id) ? "Unpin anime" : "Pin anime"}
            >
              {data.pinnedIds.includes(anime.id) ? <Star className="text-purple-600 fill-purple-600" size={20} /> : <StarOff size={20} />}
            </button>
            <div className="aspect-[3/4] border-2 border-black dark:border-white/20 overflow-hidden mb-2 bg-black">
               <img src={anime.coverImage.large} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={anime.title.english || anime.title.romaji} loading="lazy" />
            </div>
            <h3 className="font-black uppercase text-sm line-clamp-2 leading-tight">{anime.title.english || anime.title.romaji}</h3>
            <p className="text-[10px] font-bold mt-1 opacity-50 uppercase">ID: {anime.id} // {anime.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
