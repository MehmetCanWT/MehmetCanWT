import { useEffect, useState } from 'react';
import { ArrowLeft, Trash2, MessageSquare } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../../lib/eden';
import { useStore } from '../../store/useStore';

export default function AdminGuestbook() {
  const { isAuth } = useStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.api.guestbook.get();
    if (res.data && Array.isArray(res.data)) {
      setEntries(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuth) fetchData();
  }, [isAuth]);

  const handleDelete = async (id: string) => {
    await api.api.admin.guestbook.delete.post({ id: Number(id) });
    fetchData();
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

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="manga-panel flex justify-between items-center bg-white group">
            <div className="border-l-4 border-black pl-4 py-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black uppercase text-sm bg-black text-white px-2 italic">
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
              className="p-3 text-red-600 hover:bg-red-600 hover:text-white border-4 border-transparent hover:border-black transition-all"
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
