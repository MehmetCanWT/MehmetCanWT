"use client";

import Buttons from "@/components/Buttons";
import ParticlesBackground from "@/components/ParticlesBackground";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import { useMemo } from "react";

const pressStart = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

export default function Home() {
  const username = "mehmetcanwt";

  const socialAccounts = useMemo(() => [
    { name: "Anime", url: "/anime" },
    { name: "Instagram", url: `https://instagram.com/${username}` },
    { name: "Discord", url: `https://discord.com/users/${username}` },
    { name: "GitHub", url: `https://github.com/${username}` },
  ], [username]);

  return (
    <main
      className={`${pressStart.className} flex flex-col items-center justify-center text-center p-4 min-h-screen relative overflow-hidden`}
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

      {/* Anime-style greeting text */}
      <div className="anime-greeting mb-4">
        <span className="kawaii-text">こんにちは! ✨</span>
      </div>

      {/* Profil Foto with anime-style frame */}
      <div className="relative avatar-container-anime">
        <div className="anime-frame">
          <div className="relative w-32 h-32 rounded-full border-4 border-purple-500 overflow-hidden avatar-container">
            <Image
              src="https://lh3.googleusercontent.com/a/ACg8ocKICuR1GyCWBEDYC9GCjFg7KBBA_JXEXkAvTPnb8SrLmYav_3yI=s288-c-no"
              alt="Profile"
              fill
              className="object-cover no-zoom"
              priority
              sizes="128px"
              suppressHydrationWarning
              style={{ pointerEvents: 'none' }}
            />
          </div>
          {/* Anime-style sparkles around avatar */}
          <div className="avatar-sparkles">
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">💫</div>
            <div className="sparkle sparkle-3">⭐</div>
            <div className="sparkle sparkle-4">✨</div>
          </div>
        </div>
      </div>

      {/* İsim with anime-style effects */}
      <h1 className="text-3xl font-bold mt-6 text-purple-300 anime-title">
        <span className="inline-block">M</span>
        <span className="inline-block">e</span>
        <span className="inline-block">h</span>
        <span className="inline-block">m</span>
        <span className="inline-block">e</span>
        <span className="inline-block">t</span>
        <span className="inline-block">C</span>
        <span className="inline-block">a</span>
        <span className="inline-block">n</span>
      </h1>
      <p className="text-lg text-pink-400 anime-subtitle">
        <span className="kawaii-emoji">🌸</span> Anime & Code Enthusiast 
        <span className="kawaii-emoji">💻✨</span>
      </p>

      {/* Anime-style status badge */}
      <div className="anime-status-badge mt-2">
        <span className="status-text">Currently: Coding & Watching Anime</span>
        <span className="status-emoji">🍀</span>
      </div>

      {/* Sosyal medya butonları */}
      <Buttons accounts={socialAccounts} />

      {/* Spotify Player */}
      <div className="w-full max-w-md mt-6">
        <SpotifyPlayer />
      </div>

      {/* Anime-style visitor counter */}
      <div className="mt-8 anime-counter-container">
        <div className="anime-counter-label">
          <span className="kawaii-text-small">Visitors Desu!</span>
          <span className="kawaii-emoji">🌟</span>
        </div>
        <Image
          src="https://count.getloli.com/@mehmetcanwt?name=mehmetcanwt&theme=booru-qualityhentais&padding=10&offset=0&align=top&scale=1.5&pixelated=1&darkmode=0"
          alt="Visitor Count"
          width={500}
          height={50}
          className="mx-auto filter brightness-125 contrast-110 drop-shadow-[0_0_20px_rgba(255,192,203,0.9)] hover:scale-105 transition-transform duration-300 anime-counter no-zoom"
          unoptimized
          suppressHydrationWarning
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* Anime-style footer message */}
      <div className="anime-footer mt-6">
        <p className="kawaii-text-small">
          ありがとうございます! <span className="kawaii-emoji">💖</span>
        </p>
      </div>
    </main>
  );
}
