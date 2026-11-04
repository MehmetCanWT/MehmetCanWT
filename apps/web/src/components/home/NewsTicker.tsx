import type { NewsItem } from '../../types';

interface NewsTickerProps {
  news: NewsItem[];
}

export default function NewsTicker({ news }: NewsTickerProps) {
  const items = Array.isArray(news) && news.length > 0
    ? news
    : [
        { title: "SYSTEM ARCHIVE ONLINE // TELEMETRY LINK ACTIVE", source: "System" },
        { title: "STEAM LIBRARY SYNCED WITH STEAMDB RECORD", source: "Steam" },
      ];
  
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-black/95 text-white border-t-2 border-black dark:border-zinc-800 h-9 flex items-center overflow-hidden z-50 backdrop-blur-sm">
      <div className="bg-red-600 text-white font-black italic text-[11px] px-3 h-full flex items-center shrink-0 z-10 border-r-2 border-black tracking-wider shadow-[2px_0px_0px_0px_rgba(0,0,0,1)]">
        LIVE FEED
      </div>
      <div className="flex whitespace-nowrap animate-manga-scroll text-zinc-300 font-bold tracking-wide text-xs uppercase items-center">
        {items.map((item, i) => (
          <span key={i} className="mx-6 flex items-center gap-2">
            <span className="text-red-500 font-black text-[10px]">●</span>
            <span className="text-white font-bold">{item.title}</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono">[{item.source}]</span>
          </span>
        ))}
        {items.map((item, i) => (
          <span key={`loop-${i}`} className="mx-6 flex items-center gap-2">
            <span className="text-red-500 font-black text-[10px]">●</span>
            <span className="text-white font-bold">{item.title}</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono">[{item.source}]</span>
          </span>
        ))}
      </div>
    </footer>
  );
}
