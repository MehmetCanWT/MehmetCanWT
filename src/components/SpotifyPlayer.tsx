"use client";

import { useState, useEffect } from 'react';

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  preview_url: string | null;
  external_url: string;
  is_playing: boolean;
  played_at?: string; // Recently played timestamp
}

export default function SpotifyPlayer() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecentlyPlayed, setIsRecentlyPlayed] = useState(false);

  useEffect(() => {
    fetchCurrentTrack();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchCurrentTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch('/api/spotify/current-track');
      const data = await response.json();
      
      if (data.success && data.track) {
        setCurrentTrack(data.track);
        setIsRecentlyPlayed(data.message === 'Recently played track');
        setLoading(false);
      } else {
        setCurrentTrack(null);
        setIsRecentlyPlayed(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!currentTrack?.preview_url) return;

    if (isPlaying) {
      audio?.pause();
      setIsPlaying(false);
    } else {
      if (audio) {
        audio.play();
      } else {
        const newAudio = new Audio(currentTrack.preview_url);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        newAudio.play();
        setAudio(newAudio);
      }
      setIsPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="spotify-player bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 backdrop-filter backdrop-blur-sm border border-green-400/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-green-500/20 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-green-500/20 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="spotify-player bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 backdrop-filter backdrop-blur-sm border border-green-400/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-xl">🎵</span>
          </div>
          <div className="flex-1">
            <p className="text-green-300 font-medium">No recent music found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="spotify-player bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 backdrop-filter backdrop-blur-sm border border-green-400/20 rounded-2xl p-4 mb-6 transition-all duration-300 hover:border-green-400/40">
      <div className="flex items-center gap-4">
        {/* Album Art */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
          <img
            src={currentTrack.image}
            alt={currentTrack.album}
            className="w-full h-full object-cover"
          />
          {currentTrack.is_playing && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-green-300 font-medium text-sm truncate">
            {currentTrack.name}
          </h3>
          <p className="text-green-400/70 text-xs truncate">
            by {currentTrack.artist}
          </p>
          <div className="flex items-center justify-center mt-1">
            {currentTrack.is_playing ? (
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                🎵 Playing
              </span>
            ) : isRecentlyPlayed ? (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                🕒 Recently played
              </span>
            ) : null}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {currentTrack.preview_url && (
            <button
              onClick={togglePlay}
              className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              {isPlaying ? (
                <span className="text-green-400 text-sm">⏸️</span>
              ) : (
                <span className="text-green-400 text-sm">▶️</span>
              )}
            </button>
          )}
          
          <a
            href={currentTrack.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
            title="Open in Spotify"
          >
            <span className="text-green-400 text-sm">🎧</span>
          </a>
        </div>
      </div>

      {/* Progress Bar (if playing) */}
      {currentTrack.is_playing && (
        <div className="mt-3 w-full bg-green-900/30 rounded-full h-1">
          <div className="bg-green-400 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      )}
    </div>
  );
}
