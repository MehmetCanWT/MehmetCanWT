"use client";

import { FaDiscord, FaInstagram, FaGithub } from "react-icons/fa";

type SocialButton = {
  name: string;
  url: string;
};

type ButtonsProps = {
  accounts: SocialButton[];
};

export default function Buttons({ accounts }: ButtonsProps) {
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "discord": return <FaDiscord size={20} />;
      case "instagram": return <FaInstagram size={20} />;
      case "github": return <FaGithub size={20} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
      {accounts.map((account) => {
        let bgClass = "bg-gray-800"; // default
        if (account.name.toLowerCase() === "discord") bgClass = "bg-indigo-600";
        if (account.name.toLowerCase() === "instagram") bgClass = "bg-pink-500";
        if (account.name.toLowerCase() === "github") bgClass = "bg-gray-800";

        return (
          <a
            key={account.name}
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`button-glow flex items-center justify-center gap-2 ${bgClass} text-white py-3 rounded-xl shadow-lg transition-transform duration-300`}
          >
            {getIcon(account.name)} {account.name}
          </a>
        );
      })}
    </div>
  );
}
