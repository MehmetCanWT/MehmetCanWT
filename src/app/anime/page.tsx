"use client";

import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// ParticlesBackground'u lazy load et
const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-indigo-900/20 to-black/20" />
});

const pressStart = Press_Start_2P({ 
  subsets: ["latin"], 
  weight: ["400"],
  display: 'swap',
  preload: true,
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

  // Score'u yıldıza çeviren fonksiyon (AniList score 1-5 arası geliyor)
  const getStarRating = (score: string) => {
    const numScore = parseInt(score);
    if (!numScore || numScore <= 0) return 'Unrated';
    
    // Score zaten 1-5 arasında, yıldız sayısını sınırla
    const stars = Math.max(1, Math.min(5, numScore));
    
    const filledStars = '★'.repeat(stars);
    const emptyStars = '☆'.repeat(5 - stars);
    
    return filledStars + emptyStars;
  };

  // Kullanıcı anime listesini sadece database'den çek
  useEffect(() => {
    const fetchUserAnimeList = async () => {
      try {
        setLoading(true);
        
        // Sadece database'den çek, güncelleme yapmadan
        const response = await fetch('/api/user-anime?cache_only=true');
        const result = await response.json();
        
        if (result.success) {
          const mappedAnimes = result.data.map((anime: any) => ({
            id: anime.id,
            name: anime.title_english || anime.title_romaji,
            imageUrl: anime.image_url,
            rating: anime.score > 0 ? anime.score.toString() : '0', // Score'u string olarak sakla
            status: anime.status,
          }));
          
          setAnimeList(mappedAnimes);
          console.log(`Loaded ${mappedAnimes.length} anime from database cache`);
        } else {
          console.error('Failed to fetch user anime list:', result.error);
        }
      } catch (error) {
        console.error('Error fetching user anime list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnimeList();
  }, []);

  return (
    <main
      className={`${pressStart.className} flex flex-col items-center justify-center text-center p-2 sm:p-4 min-h-screen relative overflow-hidden`}
    >
      {/* Particle background */}
      <ParticlesBackground />

      {/* Anime-style decorative elements */}
      <div className="anime-decorations">
        <div className="floating-star star-1">✦</div>
        <div className="floating-star star-2">✧</div>
        <div className="floating-star star-3">⟡</div>
        <div className="floating-star star-4">✦</div>
        <div className="floating-star star-5">❋</div>
        <div className="floating-star star-6">✧</div>
      </div>

      {/* Back button - Mobile friendly */}
      <div className="fixed top-4 left-4 z-20 sm:absolute">
        <Link
          href="/"
          className="anime-button back-btn bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white py-3 px-4 sm:py-2 sm:px-4 rounded-xl relative overflow-hidden group transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 border border-white/20 shadow-lg inline-block"
          aria-label="Go back to home page"
        >
          <div className="flex items-center justify-center gap-2 relative z-10 font-bold text-sm">
            <span className="text-lg sm:text-base">←</span>
            <span className="text-shadow hidden sm:inline">Back</span>
          </div>
          
          {/* Mobilde basit efekt */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out hidden sm:block"></div>
        </Link>
      </div>

      {/* Page title - Mobile friendly */}
      <div className="anime-greeting mb-6 mt-20 sm:mt-16 px-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-purple-300 anime-title mb-2">
          <span className="inline-block">A</span>
          <span className="inline-block">n</span>
          <span className="inline-block">i</span>
          <span className="inline-block">m</span>
          <span className="inline-block">e</span>
          <span className="kawaii-emoji ml-2 sm:ml-4">🌸</span>
        </h1>
        <p className="kawaii-text text-sm sm:text-base">My AniList Collection</p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="anime-card bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-indigo-900/30 backdrop-filter backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="kawaii-text-small">Loading anime collection...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Anime grid - Mobile friendly with portrait layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto px-4 w-full">
            {animeList.map((anime, index) => (
              <div
                key={anime.id}
                className="anime-card bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-indigo-900/30 backdrop-filter backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:scale-[1.02] hover:border-pink-400/50 w-full max-w-sm mx-auto"
              >
                <div className="relative w-full aspect-[3/4] mb-3 sm:mb-4 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={anime.imageUrl}
                    alt={anime.name}
                    fill
                    className="object-cover object-center transition-transform duration-300 hover:scale-105 brightness-110 contrast-105 saturate-110"
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, (max-width: 1280px) 360px, 400px"
                    priority={index < 4} // İlk 4 resim için priority
                    quality={index < 6 ? 90 : 80} // İlk 6 resim yüksek kalite, diğerleri düşük
                    loading={index < 6 ? "eager" : "lazy"} // İlk 6 resim hemen, diğerleri lazy
                    suppressHydrationWarning
                    style={{ 
                      pointerEvents: 'none',
                      contentVisibility: index > 8 ? 'auto' : 'visible'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                  
                  {/* Mobilde glow effect'i azalt */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-purple-300 mb-2 anime-card-title">
                  {anime.name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="kawaii-text-small text-xs sm:text-sm">
                      <div className="text-yellow-300 text-lg">{getStarRating(anime.rating)}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      anime.status === 'COMPLETED' 
                        ? 'bg-green-500/20 text-green-300' 
                        : anime.status === 'WATCHING'
                        ? 'bg-blue-500/20 text-blue-300'
                        : anime.status === 'PAUSED'
                        ? 'bg-orange-500/20 text-orange-300'
                        : anime.status === 'DROPPED'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {anime.status === 'COMPLETED' ? 'Completed' : 
                       anime.status === 'WATCHING' ? 'Watching' : 
                       anime.status === 'PAUSED' ? 'Paused' : 
                       anime.status === 'DROPPED' ? 'Dropped' : 
                       anime.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add more anime placeholder - Mobile friendly */}
          <div className="mt-6 sm:mt-8 anime-status-badge px-4">
            <span className="status-text text-sm sm:text-base">More anime coming soon...</span>
            <span className="kawaii-emoji">🎌</span>
          </div>

          {/* Footer message - Mobile friendly */}
          <div className="anime-footer mt-6 sm:mt-8 px-4 pb-4">
            <p className="kawaii-text-small text-xs sm:text-sm">
              アニメが大好きです! <span className="kawaii-emoji">💖</span>
            </p>
          </div>
        </>
      )}
    </main>
  );
}
