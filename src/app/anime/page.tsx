"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FiArrowLeft } from "react-icons/fi";

const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0f] to-[#0a0a0f]" />
});

interface AnimeItem {
  id: number;
  name: string;
  imageUrl: string;
  rating: string;
  status: string;
}

export default function AnimePage() {
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getStarRating = (score: string) => {
    const numScore = parseInt(score);
    if (!numScore || numScore <= 0) return 'Unrated';
    const stars = Math.max(1, Math.min(5, numScore));
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  useEffect(() => {
    const fetchUserAnimeList = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user-anime?cache_only=true');
        const result = await response.json();
        
        if (result.success) {
          const mappedAnimes = result.data.map((anime: any) => ({
            id: anime.id,
            name: anime.title_english || anime.title_romaji,
            imageUrl: anime.image_url,
            rating: anime.score > 0 ? anime.score.toString() : '0',
            status: anime.status,
          }));
          setAnimeList(mappedAnimes);
        }
      } catch (error) {
        console.error('Error fetching user anime list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnimeList();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'WATCHING': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'PAUSED': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'DROPPED': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completed';
      case 'WATCHING': return 'Watching';
      case 'PAUSED': return 'Paused';
      case 'DROPPED': return 'Dropped';
      default: return status;
    }
  };

  return (
    <main className="flex flex-col items-center justify-start p-4 md:p-8 min-h-screen relative overflow-hidden bg-[#0a0a0f] font-outfit">
      <ParticlesBackground />

      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 anime-grid pointer-events-none opacity-50"></div>

      {/* Back button */}
      <div className="w-full max-w-7xl mx-auto flex justify-start mb-6 relative z-20 animate-slide-up">
        <Link
          href="/"
          className="glass-panel flex items-center gap-2 px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">My </span>
            <span className="text-gradient">Anime</span>
            <span className="text-white"> Collection</span>
            <span className="kawaii-emoji ml-3">🎌</span>
          </h1>
          <p className="text-gray-400">A curated list of my favorite Japanese animations.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-purple-400 font-noto-sans-jp animate-pulse">Loading collection...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {animeList.map((anime, index) => (
              <div
                key={anime.id}
                className="glass-panel rounded-2xl p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(168,85,247,0.2)] hover:border-purple-500/40 group flex flex-col"
              >
                <div className="relative w-full aspect-[3/4] mb-4 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <Image
                    src={anime.imageUrl}
                    alt={anime.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    priority={index < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 z-20">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <span className="text-yellow-400 text-sm tracking-widest">{getStarRating(anime.rating)}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight flex-1">
                  {anime.name}
                </h3>
                
                <div className="flex justify-between items-end mt-auto pt-2 border-t border-white/5">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(anime.status)} font-medium tracking-wide`}>
                    {getStatusText(anime.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && animeList.length === 0 && (
          <div className="text-center mt-12 glass-panel py-12 rounded-2xl">
            <span className="text-4xl mb-4 block">👀</span>
            <p className="text-gray-400">No anime found in the collection yet.</p>
          </div>
        )}

        <div className="mt-16 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-500 text-sm font-noto-sans-jp flex items-center justify-center gap-2 hover:text-pink-400 transition-colors">
            アニメが大好きです! <span className="kawaii-emoji">💖</span>
          </p>
        </div>
      </div>
    </main>
  );
}
