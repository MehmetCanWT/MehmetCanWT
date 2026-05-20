import { MessageSquare } from 'lucide-react';
import GuestbookForm from '../GuestbookForm';
import type { GuestbookEntry } from '../../types';

interface GuestbookSectionProps {
  entries: GuestbookEntry[];
  onNewEntry: () => void;
}

export default function GuestbookSection({ entries, onNewEntry }: GuestbookSectionProps) {
  return (
    <section className="space-y-4">
      <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
        <MessageSquare size={20} /> SYSTEM LOGS // GUESTBOOK
      </div>
      <div className="manga-panel space-y-6">
        <GuestbookForm onSuccess={onNewEntry} />
        <div className="border-t-4 border-black dark:border-white/20 pt-4 space-y-4">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id} className="border-l-4 border-black dark:border-white/20 pl-4 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black uppercase text-sm bg-black text-white dark:bg-white dark:text-black px-2 italic">
                    {entry.username}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">
                    [{new Date(entry.createdAt).toLocaleString()}]
                  </span>
                </div>
                <p className="font-bold uppercase text-sm tracking-tight">{entry.message}</p>
              </div>
            ))
          ) : (
            <p className="font-bold italic text-gray-400">NO LOGS FOUND. BE THE FIRST TO POST.</p>
          )}
        </div>
      </div>
    </section>
  );
}
