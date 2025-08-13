"use client";

import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import ParticlesBackground from "@/components/ParticlesBackground";

const pressStart = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

export default function AnimePage() {
  const favoriteAnimes = [
    {
      name: "One Piece",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg",
      rating: "10/10",
      status: "Watching"
    },
    {
      name: "Naruto",
      image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-dE6UHbFFg1A5.jpg",
      rating: "10/10",
      status: "Completed"
    },
    {
      name: "Demon Slayer",
      image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      rating: "9/10",
      status: "Watching"
    },
  ];

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
          className="anime-button back-btn bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white py-3 px-4 sm:py-2 sm:px-4 rounded-xl relative overflow-hidden group transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 border border-white/20 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 relative z-10 font-bold text-sm">
            <span className="text-lg sm:text-base">←</span>
            <span className="text-shadow hidden sm:inline">Back</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
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
        <p className="kawaii-text text-sm sm:text-base">My Favorite Anime Collection</p>
      </div>

      {/* Anime grid - Mobile friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 w-full">
        {favoriteAnimes.map((anime, index) => (
          <div
            key={index}
            className="anime-card bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-indigo-900/30 backdrop-filter backdrop-blur-lg border border-white/10 rounded-2xl p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:border-pink-400/50"
          >
            <div className="relative w-full h-48 sm:h-64 mb-3 sm:mb-4 rounded-xl overflow-hidden">
              <Image
                src={anime.image}
                alt={anime.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110 no-zoom"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                suppressHydrationWarning
                style={{ pointerEvents: 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-purple-300 mb-2 anime-card-title">
              {anime.name}
            </h3>
            
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="kawaii-text-small text-xs sm:text-sm">
                Rating: <span className="text-yellow-300">{anime.rating}</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                anime.status === 'Completed' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {anime.status}
              </span>
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
    </main>
  );
}
