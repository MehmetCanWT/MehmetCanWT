"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';

interface SpotifyTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  preview_url: string | null;
  external_url: string;
  is_playing: boolean;
}

interface RecentlyPlayedTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  external_url: string;
  played_at: string;
  preview_url: string | null;
}

function SpotifyPlayer() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentTrack();
    // Her 30 saniyede bir sadece current track'i güncelle
    const interval = setInterval(fetchCurrentTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentTrack = useCallback(async () => {
    try {
      const response = await fetch('/api/spotify/current-track');
      const data = await response.json();
      
      if (data.success && data.track) {
        setCurrentTrack(data.track);
        setLoading(false);
      } else {
        setCurrentTrack(null);
        // Sadece current track null olduğunda recently played'i çek
        if (recentlyPlayed.length === 0) {
          fetchRecentlyPlayed();
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
      setLoading(false);
    }
  }, [recentlyPlayed.length]);

  const fetchRecentlyPlayed = useCallback(async () => {
    try {
      const response = await fetch('/api/spotify/recently-played');
      const data = await response.json();
      
      if (data.success && data.tracks) {
        setRecentlyPlayed(data.tracks);
      }
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
    }
  }, []);

  const togglePlay = useCallback(() => {
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
  }, [currentTrack?.preview_url, isPlaying, audio]);

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
    // Show the most recently played track if available
    const lastTrack = recentlyPlayed[0];
    
    if (lastTrack) {
      return (
        <div className="spotify-player bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 backdrop-filter backdrop-blur-sm border border-green-400/20 rounded-2xl p-6 mb-6 transition-all duration-300 hover:border-green-400/40">
          <div className="flex items-center gap-6">
            {/* Album Art */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <Image
                src={lastTrack.image}
                alt={lastTrack.album}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 text-center">
              <h3 className="text-white font-semibold text-lg truncate mb-1">
                {lastTrack.name}
              </h3>
              <p className="text-green-300 text-base truncate mb-2">
                by {lastTrack.artist}
              </p>
              <div className="flex items-center justify-center">
                <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  🎵 Recently played
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <a
                href={lastTrack.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
                title="Open in Spotify"
              >
                <span className="text-green-400 text-lg">🎧</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Fallback if no recently played tracks
    return (
      <div className="spotify-player bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 backdrop-filter backdrop-blur-sm border border-green-400/20 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-green-400 text-xl">🎵</span>
          </div>
          <div className="flex-1">
            <p className="text-green-300 font-medium">No music playing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="spotify-player bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/30 backdrop-filter backdrop-blur-sm border border-green-400/20 rounded-2xl p-6 mb-6 transition-all duration-300 hover:border-green-400/40">
      <div className="flex items-center gap-6">
        {/* Album Art */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
          <Image
            src={currentTrack.image}
            alt={currentTrack.album}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate mb-1">
            {currentTrack.name}
          </h3>
          <p className="text-green-300 text-base truncate mb-2">
            by {currentTrack.artist}
          </p>
          <div className="flex items-center justify-center">
            {currentTrack.is_playing && (
              <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                🎵 Playing
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {currentTrack.preview_url && (
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              {isPlaying ? (
                <span className="text-green-400 text-lg">⏸️</span>
              ) : (
                <span className="text-green-400 text-lg">▶️</span>
              )}
            </button>
          )}
          
          <a
            href={currentTrack.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
            title="Open in Spotify"
          >
            <span className="text-green-400 text-lg">🎧</span>
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

export default memo(SpotifyPlayer);
