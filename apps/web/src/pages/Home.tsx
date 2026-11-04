import { useEffect, useState, useMemo, useCallback } from 'react';
import { BookOpen, Gamepad2, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import DailyQuote from '../components/home/DailyQuote';
import FavoriteAnime from '../components/home/FavoriteAnime';
import TopGame from '../components/home/TopGame';
import GuestbookSection from '../components/home/GuestbookSection';
import DiscordPresence from '../components/home/DiscordPresence';
import NewsTicker from '../components/home/NewsTicker';
import { useDiscordPresence } from '../hooks/useDiscordPresence';
import type { AnimeEntry, SteamGame, NewsItem, GuestbookEntry, QuoteData } from '../types';

const FAVORITE_ANIME_ID = 21;

interface HomeData {
  favoriteAnime?: AnimeEntry | null;
  topGame?: SteamGame | null;
  news: NewsItem[];
  guestbook: GuestbookEntry[];
  dailyQuote?: QuoteData | null;
}

export default function Home() {
  const [data, setData] = useState<HomeData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cache:client:home');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {
      favoriteAnime: null,
      topGame: null,
      news: [],
      guestbook: [],
      dailyQuote: null,
    };
  });
  const discord = useDiscordPresence();

  // Helper to update state and synchronize with local storage
  const updateData = useCallback((updater: (prev: HomeData) => HomeData) => {
    setData((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('cache:client:home', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const fetchGuestbook = useCallback(async () => {
    try {
      const res = await fetch('/api/guestbook');
      if (res.ok) {
        const entries = (await res.json()) as GuestbookEntry[];
        if (Array.isArray(entries) && entries.length > 0) {
          updateData((prev) => ({ ...prev, guestbook: entries }));
        }
      }
    } catch (e) {
      console.error('Failed to refresh guestbook:', e);
    }
  }, [updateData]);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Anime (Prioritizing admin pinned anime)
      fetch('/api/anime')
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          const list = Array.isArray(d?.allAnime) && d.allAnime.length > 0 ? d.allAnime : null;
          if (list) {
            const pinnedList: number[] = Array.isArray(d?.pinnedIds) ? d.pinnedIds : [];
            const fav = list.find((a: AnimeEntry) => pinnedList.includes(a.id)) || list.find((a: AnimeEntry) => a.id === FAVORITE_ANIME_ID) || list[0];
            updateData((prev) => ({ ...prev, favoriteAnime: fav }));
          }
        })
        .catch(() => {});

      // 2. Fetch Games (Prioritizing admin pinned game)
      fetch('/api/games')
        .then((r) => r.ok ? r.json() : null)
        .then((d) => {
          const games = Array.isArray(d?.allGames) && d.allGames.length > 0 ? d.allGames : null;
          if (games) {
            const pinnedList: number[] = Array.isArray(d?.pinnedIds) ? d.pinnedIds : [];
            const top = games.find((g: SteamGame) => pinnedList.includes(g.appid)) || [...games].sort((a: SteamGame, b: SteamGame) => b.playtime_forever - a.playtime_forever)[0];
            updateData((prev) => ({ ...prev, topGame: top }));
          }
        })
        .catch(() => {});

      // 3. Fetch News
      fetch('/api/news')
        .then((r) => r.ok ? r.json() : null)
        .then((news) => {
          if (Array.isArray(news) && news.length > 0) {
            updateData((prev) => ({ ...prev, news }));
          }
        })
        .catch(() => {});

      // 4. Fetch Guestbook
      fetch('/api/guestbook')
        .then((r) => r.ok ? r.json() : null)
        .then((guestbook) => {
          if (Array.isArray(guestbook) && guestbook.length > 0) {
            updateData((prev) => ({ ...prev, guestbook }));
          }
        })
        .catch(() => {});

      // 5. Fetch Quote
      fetch('/api/quote')
        .then((r) => r.ok ? r.json() : null)
        .then((quote) => {
          if (quote && typeof quote === 'object' && quote.quote) {
            updateData((prev) => ({ ...prev, dailyQuote: quote }));
          }
        })
        .catch(() => {});
    }

    fetchData();
  }, [updateData]);

  const age = useMemo(() => {
    const birthDate = new Date("2004-10-03");
    const today = new Date();
    let a = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) a--;
    return a;
  }, []);

  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-8 pb-20">
      <SEO 
        title="MehmetCanWT // Live Archive" 
        description="Personal Terminal & Archive of MehmetCanWT. Tracking Anime, Games, and Code with live Discord telemetry." 
        url={canonicalUrl}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Anime, Steam & Guestbook */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily Quote Section */}
          <DailyQuote quote={data.dailyQuote} />

          {/* Equal Height Side-by-side: Favorite Anime & Top Game */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="h-full">
              <FavoriteAnime anime={data.favoriteAnime} />
            </div>
            <div className="h-full">
              <TopGame game={data.topGame} />
            </div>
          </div>

          {/* Guestbook Section */}
          <GuestbookSection entries={data.guestbook} onNewEntry={fetchGuestbook} />
        </div>

        {/* Right 1 Col: Live Telemetry */}
        <div className="space-y-6">
          <DiscordPresence discord={discord} />

          {/* Quick Info Panel */}
          <div className="manga-panel p-5 space-y-4 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] bg-white dark:bg-zinc-900">
            <h4 className="font-black uppercase tracking-widest text-sm border-b-2 border-black dark:border-white/20 pb-2 flex items-center justify-between">
              <span>IDENTITY_VERIFIED</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <div className="space-y-2 text-sm font-bold">
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

            <div className="pt-2 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
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

      {/* Slim Ticker at Bottom */}
      <NewsTicker news={data.news} />
    </div>
  );
}
