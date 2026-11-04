import { useEffect, useState, useMemo, useCallback } from 'react';
import { BookOpen, Gamepad2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/eden';
import SEO from '../components/SEO';
import DailyQuote from '../components/home/DailyQuote';
import FavoriteAnime from '../components/home/FavoriteAnime';
import TopGame from '../components/home/TopGame';
import GuestbookSection from '../components/home/GuestbookSection';
import DiscordPresence from '../components/home/DiscordPresence';
import NewsTicker from '../components/home/NewsTicker';
import { useDiscordPresence } from '../hooks/useDiscordPresence';
import type { AnimeEntry, SteamGame, NewsItem, GuestbookEntry, QuoteData } from '../types';

const DISCORD_ID = "1245414098238177400";
const FAVORITE_ANIME_ID = 21;

interface HomeData {
  favoriteAnime: AnimeEntry;
  topGame: SteamGame;
  news: NewsItem[];
  guestbook: GuestbookEntry[];
  dailyQuote: QuoteData;
}

// Instant fallback state so the page renders in 0ms with zero delay
const INITIAL_DATA: HomeData = {
  favoriteAnime: {
    id: 21,
    title: { english: "ONE PIECE", romaji: "ONE PIECE" },
    coverImage: { large: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg" },
    status: "CURRENT",
    averageScore: 88,
    userScore: 100,
    progress: 1100,
    description: "Monkey D. Luffy sets out to become the King of the Pirates.",
  },
  topGame: {
    appid: 346110,
    name: "ARK: Survival Evolved",
    playtime_forever: 110640,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/capsule_184x69.jpg",
  },
  news: [
    { title: "SYSTEM OPERATIONAL // MEHMETCANWT ARCHIVE ONLINE", source: "System" },
    { title: "DISCORD & STEAM SYNCED SUCCESSFULLY", source: "Telemetry" },
  ],
  guestbook: [
    {
      id: 1,
      username: "SYSTEM",
      message: "ARCHIVE NODE OPERATIONAL // ALL SYSTEMS NORMAL",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      username: "MehmetCanWT",
      message: "Welcome to my digital terminal & live archive.",
      createdAt: new Date().toISOString(),
    },
  ],
  dailyQuote: {
    quote: "Believe in the me that believes in you!",
    character: "Kamina",
    anime: "Gurren Lagann",
    characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/b2075-sWb5Xz76JWdX.png",
    animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx2001-XwRnjzGeFWRQ.png",
  },
};

export default function Home() {
  const [data, setData] = useState<HomeData>(INITIAL_DATA);
  const discord = useDiscordPresence(DISCORD_ID);

  const fetchGuestbook = useCallback(async () => {
    try {
      const guestbookRes = await api.api.guestbook.get();
      const entries = Array.isArray(guestbookRes?.data) ? (guestbookRes.data as unknown as GuestbookEntry[]) : [];
      if (entries.length > 0) {
        setData((prev) => ({ ...prev, guestbook: entries }));
      }
    } catch (e) {
      console.error('Failed to refresh guestbook:', e);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [animeRes, gameRes, newsRes, guestbookRes, quoteRes] = await Promise.all([
          api.api.anime.get().catch(() => ({ data: null })),
          api.api.games.get().catch(() => ({ data: null })),
          api.api.news.get().catch(() => ({ data: [] })),
          api.api.guestbook.get().catch(() => ({ data: [] })),
          api.api.quote.get().catch(() => ({ data: null })),
        ]);

        const rawAnime = (animeRes?.data as { allAnime?: AnimeEntry[] } | null)?.allAnime;
        const allAnime = Array.isArray(rawAnime) && rawAnime.length > 0 ? rawAnime : null;

        const rawGames = (gameRes?.data as { allGames?: SteamGame[] } | null)?.allGames;
        const allGames = Array.isArray(rawGames) && rawGames.length > 0 ? rawGames : null;

        const newsList = Array.isArray(newsRes?.data) && newsRes.data.length > 0 ? (newsRes.data as NewsItem[]) : null;
        const guestbookList = Array.isArray(guestbookRes?.data) && guestbookRes.data.length > 0 ? (guestbookRes.data as unknown as GuestbookEntry[]) : null;

        const quoteData = (quoteRes?.data && typeof quoteRes.data === 'object' && 'quote' in quoteRes.data && (quoteRes.data as QuoteData).quote)
          ? (quoteRes.data as QuoteData)
          : null;

        setData((prev) => ({
          favoriteAnime: (allAnime ? (allAnime.find((a) => a.id === FAVORITE_ANIME_ID) || allAnime[0]) : null) || prev.favoriteAnime,
          topGame: (allGames ? [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0] : null) || prev.topGame,
          news: newsList || prev.news,
          guestbook: guestbookList || prev.guestbook,
          dailyQuote: quoteData || prev.dailyQuote,
        }));
      } catch (e) {
        console.error('Background update failed:', e);
      }
    }

    fetchData();
  }, []);

  const age = useMemo(() => {
    const birthDate = new Date("2004-10-03");
    const today = new Date();
    let a = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) a--;
    return a;
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SEO 
        title="MehmetCanWT // Live Archive" 
        description="Personal Terminal & Archive of MehmetCanWT. Tracking Anime, Games, and Code with live Discord telemetry." 
        url="https://mehmetcanwt.xyz"
      />
      
      {/* Header Banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black dark:border-white/20 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              MehmetCanWT
            </h1>
          </div>
          <div className="flex items-center gap-2 font-bold text-gray-500 uppercase tracking-widest text-sm mt-1">
            <p>Personal Terminal // Node 01</p>
            <span>/</span>
            <span>Level {age} Human</span>
          </div>
        </div>

        {/* Global Nav */}
        <nav className="flex flex-wrap gap-2 sm:gap-4">
          <Link to="/anime" className="manga-panel flex items-center gap-2 font-black uppercase text-sm hover:bg-black hover:text-white transition-all">
            <BookOpen size={16} /> Anime List
          </Link>
          <Link to="/games" className="manga-panel flex items-center gap-2 font-black uppercase text-sm hover:bg-black hover:text-white transition-all">
            <Gamepad2 size={16} /> Game Vault
          </Link>
          <Link to="/code" className="manga-panel flex items-center gap-2 font-black uppercase text-sm bg-yellow-400 text-black hover:bg-black hover:text-white transition-all">
            <Terminal size={16} /> Code Vault
          </Link>
        </nav>
      </header>

      {/* Main Grid Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Anime, Steam & Guestbook */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Quote Section */}
          <DailyQuote quote={data.dailyQuote} />

          {/* Side by side: Favorite Anime & Top Game */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FavoriteAnime anime={data.favoriteAnime} />
            <TopGame game={data.topGame} />
          </div>

          {/* Guestbook Section */}
          <GuestbookSection entries={data.guestbook} onNewEntry={fetchGuestbook} />
        </div>

        {/* Right 1 Col: Live Telemetry */}
        <div className="space-y-8">
          <DiscordPresence discord={discord} />

          {/* Quick Info Panel */}
          <div className="manga-panel p-6 space-y-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] bg-white dark:bg-zinc-900">
            <h4 className="font-black uppercase tracking-widest text-sm border-b-2 border-black dark:border-white/20 pb-2 flex items-center justify-between">
              <span>IDENTITY_VERIFIED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <div className="space-y-2.5 text-sm font-bold">
              <p className="flex justify-between">
                <span className="text-zinc-500 font-mono text-xs">LOCATION:</span>
                <span>TURKIYE 🇹🇷</span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500 font-mono text-xs">ROLE:</span>
                <span>FULLSTACK ARCHITECT</span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500 font-mono text-xs">STATUS:</span>
                <span className="text-emerald-500">EVOLVING</span>
              </p>
              <p className="flex justify-between">
                <span className="text-zinc-500 font-mono text-xs">SYSTEM:</span>
                <span className="text-blue-500">NETLIFY DISTRIBUTED</span>
              </p>
            </div>

            <div className="pt-3 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <Link
                to="/admin"
                className="text-xs font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center justify-between"
              >
                <span>ADMIN TERMINAL</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker at Bottom */}
      <NewsTicker news={data.news} />
    </div>
  );
}
