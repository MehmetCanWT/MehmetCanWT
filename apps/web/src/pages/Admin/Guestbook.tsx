import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, MessageSquare } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { apiGet, apiPost } from '../../lib/api';
import type { GuestbookEntry } from '../../types';

export default function AdminGuestbook() {
  const { isAuth } = useStore();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<GuestbookEntry[]>('/api/guestbook');
      if (res && Array.isArray(res)) {
        setEntries(res);
      }
    } catch (e) {
      setError('Failed to load guestbook entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    setDeletingId(id);
    try {
      await apiPost('/api/admin/guestbook/delete', { id });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error('Failed to delete entry:', e);
      setError('Failed to delete entry. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuth) return <Navigate to="/admin" />;
  if (loading) return <div className="p-20 text-center font-black uppercase text-4xl italic animate-pulse">Scanning Logs...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <Link to="/admin" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="manga-title text-3xl flex items-center gap-2 italic uppercase">
          <MessageSquare size={28} /> Manage Logs
        </div>
      </header>

      {error && (
        <div className="bg-red-100 dark:bg-red-950 border-4 border-red-600 p-3 text-red-700 dark:text-red-400 font-black uppercase text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className={`manga-panel flex justify-between items-center bg-white dark:bg-zinc-900 group ${deletingId === entry.id ? 'opacity-50' : ''}`}>
            <div className="border-l-4 border-black dark:border-white/20 pl-4 py-1">
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
            <button
              onClick={() => handleDelete(entry.id)}
              disabled={deletingId === entry.id}
              className="p-3 text-red-600 hover:bg-red-600 hover:text-white border-4 border-transparent hover:border-black dark:hover:border-white/20 transition-all disabled:opacity-50"
              aria-label={`Delete message from ${entry.username}`}
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="manga-panel text-center py-20 italic font-black uppercase opacity-20 text-4xl">
            Archive Empty
          </div>
        )}
      </div>
    </div>
  );
}
