import type { NewsItem } from '../../types';

interface NewsTickerProps {
  news: NewsItem[];
}

export default function NewsTicker({ news }: NewsTickerProps) {
  const items = Array.isArray(news) ? news : [];
  
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-black border-t-4 border-black h-16 flex items-center overflow-hidden z-50">
      <div className="bg-red-600 text-white font-black italic px-4 py-full h-full flex items-center shrink-0 z-10 border-r-4 border-black shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]">
        BREAKING NEWS
      </div>
      <div className="flex whitespace-nowrap animate-manga-scroll text-white font-bold tracking-tight text-xl uppercase items-center">
        {items.map((item, i) => (
          <span key={i} className="mx-8 flex items-center gap-2">
            <span className="text-red-500 font-black">●</span>
            {item.title} 
            <span className="text-xs bg-white text-black px-1 font-black ml-2">[{item.source}]</span>
          </span>
        ))}
        {/* Duplicate for infinite scroll feel */}
        {items.map((item, i) => (
          <span key={`loop-${i}`} className="mx-8 flex items-center gap-2">
            <span className="text-red-500 font-black">●</span>
            {item.title} 
            <span className="text-xs bg-white text-black px-1 font-black ml-2">[{item.source}]</span>
          </span>
        ))}
      </div>
    </footer>
  );
}
