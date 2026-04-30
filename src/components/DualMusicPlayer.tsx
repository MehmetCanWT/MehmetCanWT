"use client";

import { useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';
import AppleMusicPlayer from './AppleMusicPlayer';
import { SiSpotify, SiApple } from 'react-icons/si';

export default function DualMusicPlayer() {
  const [activeTab, setActiveTab] = useState<'spotify' | 'apple'>('spotify');

  return (
    <div className="w-full max-w-md mx-auto mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      {/* Tabs */}
      <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-2xl border border-white/10 mb-4 w-fit mx-auto shadow-lg">
        <button
          onClick={() => setActiveTab('spotify')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-300 font-outfit text-sm ${
            activeTab === 'spotify' 
              ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-green-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <SiSpotify className={activeTab === 'spotify' ? 'animate-pulse' : ''} /> Spotify
        </button>
        <button
          onClick={() => setActiveTab('apple')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all duration-300 font-outfit text-sm ${
            activeTab === 'apple' 
              ? 'bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] border border-pink-500/30' 
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <SiApple className={activeTab === 'apple' ? 'animate-pulse' : ''} /> Apple Music
        </button>
      </div>

      {/* Player Content */}
      <div className="relative">
        <div className={`transition-all duration-500 ${activeTab === 'spotify' ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 translate-x-4 absolute inset-0 pointer-events-none'}`}>
          <SpotifyPlayer />
        </div>
        <div className={`transition-all duration-500 ${activeTab === 'apple' ? 'opacity-100 translate-x-0 relative z-10' : 'opacity-0 -translate-x-4 absolute inset-0 pointer-events-none'}`}>
          <AppleMusicPlayer />
        </div>
      </div>
    </div>
  );
}
