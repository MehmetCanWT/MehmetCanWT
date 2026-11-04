import { useEffect, useState, useMemo } from 'react';
import { BookOpen, ArrowLeft, Star, Search, Sparkles, Tv, CheckCircle2, PlayCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { AnimeEntry, AnimeResponse } from '../types';

interface AnimePageData {
  allAnime: AnimeEntry[];
  pinnedIds: number[];
}

type FilterStatus = 'ALL' | 'COMPLETED' | 'CURRENT' | 'DROPPED' | 'PLANNING';

export default function Anime() {
  const [data, setData] = useState<AnimePageData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cache:client:anime');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return {
      allAnime: [],
      pinnedIds: [21],
    };
  });
  const [loading, setLoading] = useState(data.allAnime.length === 0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/anime');
        if (res.ok) {
          const responseData = (await res.json()) as AnimeResponse;
          const rawList = Array.isArray(responseData?.allAnime) ? responseData.allAnime : [];
          // Deduplicate by ID
          const animeMap = new Map<number, AnimeEntry>();
          rawList.forEach((a) => {
            if (a && a.id && !animeMap.has(a.id)) {
              animeMap.set(a.id, a);
            }
          });
          const animeList = Array.from(animeMap.values());
          const pinnedIds = Array.isArray(responseData?.pinnedIds) && responseData.pinnedIds.length > 0
            ? responseData.pinnedIds
            : [21];

          const STATUS_ORDER: Record<string, number> = {
            COMPLETED: 0,
            CURRENT: 1,
            REPEATING: 1,
            DROPPED: 2,
            PLANNING: 3,
            PAUSED: 4,
          };

          // Strict sort:
          // 1. Pinned favorites first (One Piece)
          // 2. High User Stars (Score) descending: 5 stars -> 4 stars -> unrated (0)
          // 3. For equal scores, status order: COMPLETED -> CURRENT -> DROPPED -> PLANNING
          // 4. Community average score descending
          const sorted = [...animeList].sort((a, b) => {
            const isPinnedA = pinnedIds.includes(a.id);
            const isPinnedB = pinnedIds.includes(b.id);
            if (isPinnedA && !isPinnedB) return -1;
            if (!isPinnedA && isPinnedB) return 1;

            const scoreA = a.userScore || 0;
            const scoreB = b.userScore || 0;
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }

            const orderA = STATUS_ORDER[a.status?.toUpperCase() || ''] ?? 99;
            const orderB = STATUS_ORDER[b.status?.toUpperCase() || ''] ?? 99;
            if (orderA !== orderB) return orderA - orderB;

            return (b.averageScore || 0) - (a.averageScore || 0);
          });

          if (sorted.length > 0) {
            setData({ allAnime: sorted, pinnedIds });
            try {
              localStorage.setItem('cache:client:anime', JSON.stringify({ allAnime: sorted, pinnedIds }));
            } catch {}
          }
        }
      } catch (e) {
        console.error('Failed to fetch anime data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAnime = useMemo(() => {
    return data.allAnime.filter((a) => {
      // Status filter
      if (statusFilter !== 'ALL' && a.status?.toUpperCase() !== statusFilter) {
        return false;
      }
      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (a.title.english && a.title.english.toLowerCase().includes(q)) ||
        (a.title.romaji && a.title.romaji.toLowerCase().includes(q))
      );
    });
  }, [data.allAnime, search, statusFilter]);

  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/anime` : '';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-8 pb-20">
      <SEO
        title="Anime Vault // MehmetCanWT"
        description="Personal anime tracking, scores, and series archives."
        url={canonicalUrl}
      />

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          to="/"
          className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-900"
        >
          <ArrowLeft size={20} /> Back
        </Link>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 text-xs bg-rose-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles size={14} />
            <span>{data.allAnime.length} ENTRIES LOGGED</span>
          </div>
          <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
            <BookOpen size={28} className="text-rose-500" /> Anime Vault
          </div>
        </div>
      </header>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Tabs: ALL, COMPLETED, CURRENT, PLANNING, DROPPED */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'COMPLETED', 'CURRENT', 'PLANNING', 'DROPPED'] as FilterStatus[]).map((tab) => {
            const count =
              tab === 'ALL'
                ? data.allAnime.length
                : data.allAnime.filter((a) => a.status?.toUpperCase() === tab).length;
            const active = statusFilter === tab;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`manga-panel text-xs font-black uppercase px-3 py-1.5 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 ${
                  active
                    ? 'bg-rose-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    active ? 'bg-black text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="manga-panel p-3 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] bg-white dark:bg-zinc-900 flex items-center gap-3">
          <Search size={20} className="text-zinc-500 shrink-0 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH ANIME ARCHIVE (E.G. ONE PIECE, ATTACK ON TITAN)..."
            className="w-full bg-transparent outline-none font-bold uppercase text-sm tracking-wider text-black dark:text-white placeholder:text-zinc-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-black uppercase px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Grid: Vibrant Anime Cards with Star Rating */}
      {loading && filteredAnime.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="manga-panel p-4 border-3 border-black bg-white dark:bg-zinc-900 animate-pulse space-y-4">
              <div className="aspect-[3/4] w-full bg-zinc-200 dark:bg-zinc-800 rounded-md border-2 border-dashed border-zinc-400 dark:border-zinc-700" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnime.map((anime, index) => {
          const isPinned = data.pinnedIds.includes(anime.id);
          const isPlanning = anime.status?.toUpperCase() === 'PLANNING';
          const hasUserScore = typeof anime.userScore === 'number' && anime.userScore > 0;
          const stars = hasUserScore ? (anime.userScore <= 5 ? anime.userScore : Math.min(5, Math.max(1, Math.round(anime.userScore / 20)))) : null;

          return (
            <div
              key={`${anime.id}-${index}`}
              className={`manga-panel relative group overflow-hidden border-3 border-black p-4 transition-all duration-300 hover:-translate-y-1 ${
                isPinned
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-600 shadow-[5px_5px_0px_0px_rgba(225,29,72,1)]"
                  : "bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
              }`}
            >
              <div className="relative z-10 flex flex-col h-full">
                {/* Full-Color Vibrant Cover Image */}
                <div className="relative aspect-[3/4] border-2 border-black dark:border-white/30 mb-3 overflow-hidden bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <img
                    loading="lazy"
                    src={anime.coverImage.large}
                    alt={anime.title.english || anime.title.romaji}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isPinned && (
                    <div className="absolute top-2 left-2 bg-rose-600 text-white px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Star size={12} className="fill-white" />
                      <span>PINNED FAVORITE</span>
                    </div>
                  )}

                  {/* Star Rating Badge (Strictly user-given stars; PLANNING badge for planned anime) */}
                  {isPlanning ? (
                    <div className="absolute bottom-2 right-2 bg-black/90 text-zinc-300 px-2 py-0.5 text-xs font-black font-mono border border-zinc-600 flex items-center gap-1 shadow-md">
                      <Clock size={12} className="text-zinc-400" />
                      <span>PLANNING</span>
                    </div>
                  ) : stars !== null ? (
                    <div className="absolute bottom-2 right-2 bg-black/90 text-yellow-400 px-2 py-0.5 text-xs font-black font-mono border border-yellow-400 flex items-center gap-1 shadow-md">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>{stars}/5</span>
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 bg-black/90 text-zinc-400 px-2 py-0.5 text-xs font-black font-mono border border-zinc-700 flex items-center gap-1 shadow-md">
                      <span>UNRATED</span>
                    </div>
                  )}
                </div>

                {/* Info & Badges */}
                <div className="space-y-2 mt-auto">
                  <h3 className="font-black text-lg uppercase italic leading-snug line-clamp-2 text-black dark:text-white">
                    {anime.title.english || anime.title.romaji}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] font-black uppercase pt-2 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Tv size={12} /> {anime.format || 'TV'}
                    </span>
                    <span
                      className={`flex items-center gap-1 px-1.5 py-0.5 ${
                        anime.status === 'CURRENT'
                          ? 'bg-emerald-500 text-black font-black'
                          : anime.status === 'COMPLETED'
                          ? 'bg-blue-500 text-white font-black'
                          : anime.status === 'DROPPED'
                          ? 'bg-rose-600 text-white font-black'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {anime.status === 'CURRENT' ? (
                        <PlayCircle size={11} />
                      ) : anime.status === 'COMPLETED' ? (
                        <CheckCircle2 size={11} />
                      ) : anime.status === 'DROPPED' ? (
                        <XCircle size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {anime.status || 'LOGGED'}
                    </span>
                  </div>

                  {anime.progress !== undefined && (
                    <div className="text-[10px] font-mono font-bold text-zinc-500 flex justify-between">
                      <span>PROGRESS:</span>
                      <span className="text-black dark:text-white font-black">{anime.progress} EPS</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
