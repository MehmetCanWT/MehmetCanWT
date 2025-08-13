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

const Buttons = memo(function Buttons({ accounts }: ButtonsProps) {
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
    <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
      {accounts.map((account) => (
        <a
          key={account.name}
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`button-glow flex items-center justify-center gap-2 ${getBgClass(account.name)} text-white py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
          aria-label={`Visit ${account.name} profile`}
        >
          {getIcon(account.name)} {account.name}
        </a>
      ))}
    </div>
  );
});

export default Buttons;
