"use client";

import Buttons from "@/components/Buttons";
import DualMusicPlayer from "@/components/DualMusicPlayer";
import Image from "next/image";
import { useMemo } from "react";
import dynamic from "next/dynamic";

const ParticlesBackground = dynamic(() => import("@/components/ParticlesBackground"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0f] to-[#0a0a0f]" />
});

export default function Home() {
  const username = "mehmetcanwt";

  const socialAccounts = useMemo(() => [
    { name: "Anime", url: "/anime" },
    { name: "Instagram", url: `https://instagram.com/${username}` },
    { name: "Discord", url: `https://discord.com/users/${username}` },
    { name: "GitHub", url: `https://github.com/${username}` },
  ], [username]);

  return (
    <main className="flex flex-col items-center justify-center text-center p-4 min-h-screen relative overflow-hidden bg-[#0a0a0f] font-outfit">
      <ParticlesBackground />

      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 anime-grid pointer-events-none opacity-50"></div>

      <div className="relative z-10 w-full max-w-2xl mx-auto pt-10 pb-20">
        
        {/* Greeting */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-sm text-gray-300 font-medium">Coding & Watching Anime</span>
          <span className="kawaii-emoji ml-1">🌸</span>
        </div>

        {/* Profile Card */}
        <div className="glass-panel p-8 rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500/50 to-pink-500/50">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0a0a0f] relative">
                  <Image
                    src="https://lh3.googleusercontent.com/a/ACg8ocKICuR1GyCWBEDYC9GCjFg7KBBA_JXEXkAvTPnb8SrLmYav_3yI=s288-c-no"
                    alt="MehmetCan"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                    sizes="128px"
                  />
                </div>
              </div>
              {/* Sparkles */}
              <div className="absolute -top-2 -right-2 text-xl animate-float" style={{ animationDelay: '0.1s' }}>✨</div>
              <div className="absolute -bottom-1 -left-2 text-lg animate-float" style={{ animationDelay: '0.5s' }}>💫</div>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="text-gradient font-noto-sans-jp tracking-tight">Mehmet</span>
                <span className="text-white">Can</span>
              </h1>
              <p className="text-gray-400 text-lg mb-4">
                Full Stack Developer <span className="text-purple-400">&</span> Anime Fan
              </p>
              
              <Buttons accounts={socialAccounts} />
            </div>
          </div>
        </div>

        {/* Dual Music Player */}
        <DualMusicPlayer />

        {/* Visitor Counter */}
        <div className="mt-12 flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 text-xs tracking-widest uppercase font-semibold">Visitors</span>
            <span className="kawaii-emoji text-sm">🌟</span>
          </div>
          <div className="glass-panel p-3 rounded-2xl inline-block hover:scale-105 transition-transform duration-300">
            <Image
              src="https://count.getloli.com/@mehmetcanwt?name=mehmetcanwt&theme=booru-qualityhentais&padding=10&offset=0&align=top&scale=1.2&pixelated=1&darkmode=0"
              alt="Visitor Count"
              width={400}
              height={40}
              className="mx-auto filter brightness-110 contrast-125"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-gray-500 text-sm font-noto-sans-jp flex items-center justify-center gap-2 hover:text-purple-400 transition-colors cursor-pointer">
            ありがとうございます! <span className="kawaii-emoji">💖</span>
          </p>
        </div>
      </div>
    </main>
  );
}
