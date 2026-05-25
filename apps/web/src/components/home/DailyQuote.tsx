import { Quote } from 'lucide-react';
import type { QuoteData } from '../../types';

interface DailyQuoteProps {
  quote: QuoteData;
}

export default function DailyQuote({ quote }: DailyQuoteProps) {
  return (
    <section className="space-y-4">
      <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
        <Quote size={20} /> DAILY INSPIRATION
      </div>
      <div className="manga-panel relative overflow-hidden bg-white text-black dark:bg-zinc-900 dark:text-white p-6 sm:p-8">
        <div className="absolute inset-0 halftone opacity-10"></div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <div className="flex-shrink-0 relative w-24 h-24 sm:w-32 sm:h-32 aspect-square">
            <div className="w-full h-full border-4 border-black dark:border-white/20 overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              {quote.characterImage ? (
                <img src={quote.characterImage} alt={quote.character} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-4xl">?</div>
              )}
            </div>
            {quote.animeImage && (
              <div className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 border-4 border-black dark:border-white/20 overflow-hidden bg-zinc-100 dark:bg-zinc-800 rounded-2xl">
                <img src={quote.animeImage} alt={quote.anime} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xl sm:text-2xl font-black italic uppercase leading-snug">
              &quot;{quote.quote}&quot;
            </p>
            <div className="mt-4 inline-flex flex-col items-center sm:items-start">
              <span className="bg-black text-white dark:bg-white dark:text-black px-3 py-1 font-black text-sm sm:text-base uppercase tracking-widest">
                {quote.character}
              </span>
              <span className="text-xs sm:text-sm font-bold text-black/60 dark:text-gray-500 uppercase mt-1">
                IN // {quote.anime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
