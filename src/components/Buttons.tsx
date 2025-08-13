"use client";

import { FaDiscord, FaInstagram, FaGithub } from "react-icons/fa";
import { memo, useMemo } from "react";

type SocialButton = {
  name: string;
  url: string;
};

type ButtonsProps = {
  accounts: SocialButton[];
};

function ButtonsComponent({ accounts }: ButtonsProps) {
  const getIcon = useMemo(() => (name: string) => {
    switch (name.toLowerCase()) {
      case "discord": return <FaDiscord size={24} className="icon-glow" />;
      case "instagram": return <FaInstagram size={24} className="icon-glow" />;
      case "github": return <FaGithub size={24} className="icon-glow" />;
      default: return null;
    }
  }, []);

  const getBgClass = useMemo(() => (name: string) => {
    switch (name.toLowerCase()) {
      case "discord": return "anime-button discord-btn bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600";
      case "instagram": return "anime-button instagram-btn bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600";
      case "github": return "anime-button github-btn bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900";
      default: return "anime-button bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900";
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mt-6">
      {accounts.map((account) => (
        <a
          key={account.name}
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${getBgClass(account.name)} text-white py-4 px-6 rounded-2xl relative overflow-hidden group transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 border border-white/20`}
          aria-label={`Visit ${account.name} profile`}
        >
          <div className="flex items-center justify-center gap-3 relative z-10 font-bold text-lg">
            {getIcon(account.name)} 
            <span className="text-shadow group-hover:animate-pulse">{account.name}</span>
          </div>
          
          {/* Anime-style shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          
          {/* Border glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
          <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500 delay-100"></div>
          <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700 delay-200"></div>
        </a>
      ))}
    </div>
  );
}

const Buttons = memo(ButtonsComponent);
Buttons.displayName = 'Buttons';

export default Buttons;
