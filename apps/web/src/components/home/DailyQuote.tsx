import { Quote, Sparkles } from 'lucide-react';
import type { QuoteData } from '../../types';

interface DailyQuoteProps {
  quote?: QuoteData | null;
}

export default function DailyQuote({ quote }: DailyQuoteProps) {
  if (!quote) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
            <Quote size={20} className="text-yellow-500 fill-yellow-500" />
            <span>DAILY TRANSMISSION</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
            <Sparkles size={11} /> INSPIRATION
          </span>
        </div>

        <div className="manga-panel relative overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-5 sm:p-7 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] animate-pulse">
          <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
            <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-md bg-zinc-200 dark:bg-zinc-800 border-2 border-dashed border-zinc-400 dark:border-zinc-700 shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            </div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
          <Quote size={20} className="text-yellow-500 fill-yellow-500" />
          <span>DAILY TRANSMISSION</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 rounded-sm border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
          <Sparkles size={11} /> INSPIRATION
        </span>
      </div>

      <div className="manga-panel relative overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-5 sm:p-7 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
          {/* Dual Character & Anime Visuals */}
          <div className="flex-shrink-0 relative w-24 h-24 sm:w-28 sm:h-28 aspect-square">
            <div className="w-full h-full border-3 border-black dark:border-white/30 overflow-hidden bg-zinc-950 relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-md">
              {quote.characterImage ? (
                <img src={quote.characterImage} alt={quote.character} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-3xl bg-zinc-800 text-white">?</div>
              )}
            </div>
            {quote.animeImage && (
              <div className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 border-3 border-black dark:border-white/30 overflow-hidden bg-zinc-950 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <img src={quote.animeImage} alt={quote.anime} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <p className="text-lg sm:text-xl font-black italic uppercase leading-snug tracking-tight">
              &quot;{quote.quote}&quot;
            </p>
            <div className="inline-flex flex-col items-center sm:items-start">
              <span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 font-black text-xs sm:text-sm uppercase tracking-widest border border-black">
                {quote.character}
              </span>
              <span className="text-xs font-bold text-zinc-500 uppercase mt-1">
                SERIES // {quote.anime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
