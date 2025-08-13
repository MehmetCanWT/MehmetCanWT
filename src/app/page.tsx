"use client";

import Buttons from "@/components/Buttons";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Press_Start_2P } from "next/font/google";

const pressStart = Press_Start_2P({ subsets: ["latin"], weight: ["400"] });

export default function Home() {
  const username = "mehmetcanwt";

  const socialAccounts = [
    { name: "Discord", url: `https://discord.com/users/${username}` },
    { name: "Instagram", url: `https://instagram.com/${username}` },
    { name: "GitHub", url: `https://github.com/${username}` },
  ];

  return (
    <main
      className={`${pressStart.className} flex flex-col items-center justify-center text-center p-4 min-h-screen relative overflow-hidden`}
    >
      {/* Particle background */}
      <ParticlesBackground />

      {/* Profil Foto */}
      <img
        src="https://lh3.googleusercontent.com/a/ACg8ocKICuR1GyCWBEDYC9GCjFg7KBBA_JXEXkAvTPnb8SrLmYav_3yI=s288-c-no"
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-lg avatar"
      />

      {/* İsim */}
      <h1 className="text-3xl font-bold mt-4 text-purple-300">MehmetCan</h1>
      <p className="text-lg text-pink-400">Anime & Code Enthusiast 💻✨</p>

      {/* Sosyal medya butonları */}
      <Buttons accounts={socialAccounts} />

      {/* Visitor sayacı */}
      <div className="mt-6">
        <img
          src="https://count.getloli.com/@mehmetcanwt?name=mehmetcanwt&theme=booru-qualityhentais&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=0"
          alt="Visitor Count"
          className="mx-auto filter brightness-125 drop-shadow-[0_0_15px_rgba(255,192,203,0.9)]"
        />
      </div>
    </main>
  );
}
