import { useEffect, useState } from 'react';
import { BookOpen, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/eden';

export default function Anime() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const res = await api.api.anime.get();
      if (res.data) {
        const sorted = [...res.data.allAnime].sort((a: any, b: any) => {
          const isPinnedA = res.data.pinnedIds.includes(a.id);
          const isPinnedB = res.data.pinnedIds.includes(b.id);
          if (isPinnedA && !isPinnedB) return -1;
          if (!isPinnedA && isPinnedB) return 1;
          return (b.userScore || 0) - (a.userScore || 0);
        });
        setData({ allAnime: sorted, pinnedIds: res.data.pinnedIds });
      }
    }
    fetchData();
  }, []);

  if (!data) return <div className="p-20 text-center font-black uppercase text-4xl italic animate-pulse">Scanning Archive...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
          <BookOpen size={28} /> Anime Archive
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.allAnime.map((anime: any) => (
          <div key={anime.id} className={`manga-panel relative group overflow-hidden ${data.pinnedIds.includes(anime.id) ? "ring-4 ring-purple-600 bg-purple-50" : "bg-zinc-50"}`}>
            <div className="relative z-10 flex flex-col h-full">
              <div className="relative aspect-[3/4] border-2 border-black mb-4 overflow-hidden bg-black">
                <img 
                  src={anime.coverImage.large} 
                  alt={anime.title.english}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                {data.pinnedIds.includes(anime.id) && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white p-1">
                    <Star size={16} fill="white" />
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="text-right w-full">
                  <p className="text-4xl font-black italic tracking-tighter leading-none">{anime.userScore || "??"}%</p>
                  <p className="font-bold text-[10px] uppercase text-gray-500">User Score Rating</p>
                </div>
              </div>
              
              <div className="mt-auto border-t-2 border-black pt-4">
                <h3 className="font-black text-xl uppercase italic leading-tight mb-2 line-clamp-2">{anime.title.english || anime.title.romaji}</h3>
                <div className="flex justify-between items-center font-bold text-[10px] uppercase">
                  <span className="bg-black text-white px-2 py-0.5">{anime.format}</span>
                  <span className={anime.status === 'CURRENT' ? 'text-green-600 animate-pulse' : 'text-gray-400'}>
                    {anime.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
