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

const DISCORD_ID = "736294975760826438";
const FAVORITE_ANIME_ID = 21;

interface HomeData {
  favoriteAnime: AnimeEntry | null;
  topGame: SteamGame | null;
  news: NewsItem[];
  guestbook: GuestbookEntry[];
  dailyQuote: QuoteData;
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const discord = useDiscordPresence(DISCORD_ID);

  const fetchGuestbook = useCallback(async () => {
    try {
      const guestbookRes = await api.api.guestbook.get();
      setData((prev) => prev ? { ...prev, guestbook: (guestbookRes.data as GuestbookEntry[]) || [] } : prev);
    } catch (e) {
      console.error('Failed to refresh guestbook:', e);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [animeRes, gameRes, newsRes, guestbookRes, quoteRes] = await Promise.all([
          api.api.anime.get(),
          api.api.games.get(),
          api.api.news.get(),
          api.api.guestbook.get(),
          api.api.quote.get()
        ]);
        
        const allAnime = (animeRes.data as { allAnime: AnimeEntry[] } | null)?.allAnime || [];
        const allGames = (gameRes.data as { allGames: SteamGame[] } | null)?.allGames || [];

        setData({
          favoriteAnime: allAnime.find((a) => a.id === FAVORITE_ANIME_ID) || allAnime[0] || null,
          topGame: [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0] || null,
          news: (newsRes.data as NewsItem[]) || [],
          guestbook: (guestbookRes.data as GuestbookEntry[]) || [],
          dailyQuote: (quoteRes.data as QuoteData) || { quote: "Loading...", character: "System", anime: "Archive" }
        });
      } catch (e) {
        console.error('Failed to fetch initial data:', e);
        setError('Failed to load data. Please refresh the page.');
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-black uppercase italic text-2xl text-red-600">{error}</p>
        <button onClick={() => window.location.reload()} className="manga-panel font-black uppercase hover:bg-black hover:text-white transition-all">
          RETRY
        </button>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center font-black uppercase italic text-4xl animate-pulse">Initializing System...</div>;

  const { favoriteAnime, topGame, news, guestbook, dailyQuote } = data;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <SEO />
      {/* Header Panel */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 manga-panel flex flex-col justify-center items-center xl:items-start text-center xl:text-left overflow-hidden">
          <h1 className="text-[12vw] sm:text-[9vw] md:text-[6vw] lg:text-[5vw] font-black italic tracking-tighter uppercase leading-none whitespace-nowrap">
            Mehmet<span className="bg-black text-white dark:bg-white dark:text-black px-1 sm:px-2 ml-1">Can</span>WT
          </h1>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 border-t-4 border-black dark:border-white/20 pt-2 w-full justify-center xl:justify-start">
            <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-center">
              Personal Terminal // Node 01
            </p>
            <span className="hidden sm:block text-black/20 dark:text-white/20 text-2xl font-black">/</span>
            <div className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-sm font-black italic uppercase inline-block">
              Level {age} Human
            </div>
          </div>
        </div>
        <nav className="manga-panel bg-black text-white flex flex-col items-center justify-center space-y-2 sm:space-y-4 py-6 sm:py-0">
           <Link to="/anime" className="text-xl sm:text-2xl font-black italic uppercase hover:text-purple-400 transition-colors flex items-center gap-2 w-full justify-center border-b border-white/20 pb-2">
             <BookOpen size={20} /> Anime List
           </Link>
           <Link to="/games" className="text-xl sm:text-2xl font-black italic uppercase hover:text-pink-400 transition-colors flex items-center gap-2 w-full justify-center border-b border-white/20 pb-2">
             <Gamepad2 size={20} /> Game Vault
           </Link>
           <Link to="/code" className="text-xl sm:text-2xl font-black italic uppercase hover:text-green-400 transition-colors flex items-center gap-2 w-full justify-center">
             <Terminal size={20} /> Code Vault
           </Link>
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <DailyQuote quote={dailyQuote} />

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {favoriteAnime ? <FavoriteAnime anime={favoriteAnime} /> : <div className="manga-panel">Loading...</div>}
            {topGame ? <TopGame game={topGame} /> : <div className="manga-panel">Loading...</div>}
          </div>

          <GuestbookSection entries={guestbook} onNewEntry={fetchGuestbook} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <DiscordPresence discord={discord} />

          {/* Quick Stats / Identity */}
          <section className="manga-panel bg-black text-white p-4">
             <h4 className="font-black italic uppercase border-b border-white/20 mb-2 pb-1 text-sm">IDENTITY_VERIFIED</h4>
             <div className="space-y-1 text-[10px] font-bold font-mono">
                <p>LOCATION: TURKIYE</p>
                <p>ROLE: FULLSTACK_RENEGADE</p>
                <p>STATUS: EVOLVING</p>
                <p>UPLINK: ACTIVE</p>
             </div>
          </section>
        </div>
      </div>

      <NewsTicker news={news} />
    </div>
  );
}