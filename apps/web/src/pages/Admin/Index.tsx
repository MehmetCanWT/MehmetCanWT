import { useState } from 'react';
import { LayoutDashboard, BookOpen, Gamepad2, ShieldCheck, MessageSquare, LogOut, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { apiPost } from '../../lib/api';

export default function AdminIndex() {
  const { isAuth, setAuth, logout } = useStore();
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "success" | "error">("idle");

  const handleAuth = async () => {
    if (!pass.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAuth(true);
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (e) {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceQuote = async () => {
    setQuoteLoading(true);
    setQuoteStatus("idle");
    try {
      await apiPost('/api/admin/quote/force-update', {});
      setQuoteStatus("success");
      setTimeout(() => setQuoteStatus("idle"), 3000);
    } catch (e) {
      setQuoteStatus("error");
      setTimeout(() => setQuoteStatus("idle"), 3000);
    } finally {
      setQuoteLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-4">
        <div className="manga-panel w-full max-w-md space-y-4">
          <div className="flex justify-center mb-4 text-black dark:text-white">
            <ShieldCheck size={64} />
          </div>
          <h1 className="manga-title text-2xl w-full text-center">ADMIN ACCESS</h1>
          {error && (
            <div className="bg-red-100 dark:bg-red-950 border-4 border-red-600 p-3 text-red-700 dark:text-red-400 font-black uppercase text-sm text-center">
              {error}
            </div>
          )}
          <label htmlFor="admin-password" className="sr-only">Access Code</label>
          <input 
            id="admin-password"
            type="password" 
            placeholder="ACCESS CODE" 
            className="w-full border-4 border-black dark:border-white/20 p-3 font-black uppercase focus:bg-zinc-100 dark:focus:bg-zinc-800 outline-none bg-white dark:bg-zinc-900 dark:text-white"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            disabled={loading}
          />
          <button 
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-black text-white dark:bg-white dark:text-black p-3 font-black uppercase hover:bg-zinc-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all">
          <LayoutDashboard size={20} /> Home
        </Link>
        <div className="flex items-center gap-4">
          <div className="manga-title text-3xl italic uppercase">Admin Terminal</div>
          <button
            onClick={logout}
            className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 text-red-600 hover:bg-red-600 hover:text-white transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/admin/anime" className="manga-panel group hover:bg-black hover:text-white transition-all p-12 flex flex-col items-center justify-center space-y-4">
          <BookOpen size={64} className="group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-black uppercase italic">Manage Anime</span>
          <p className="text-xs font-bold opacity-60">Pin and filter your archive</p>
        </Link>

        <Link to="/admin/games" className="manga-panel group hover:bg-black hover:text-white transition-all p-12 flex flex-col items-center justify-center space-y-4">
          <Gamepad2 size={64} className="group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-black uppercase italic">Manage Games</span>
          <p className="text-xs font-bold opacity-60">Pin and reorder missions</p>
        </Link>

        <Link to="/admin/guestbook" className="manga-panel group hover:bg-black hover:text-white transition-all p-12 flex flex-col items-center justify-center space-y-4">
          <MessageSquare size={64} className="group-hover:scale-110 transition-transform" />
          <span className="text-3xl font-black uppercase italic">Manage Logs</span>
          <p className="text-xs font-bold opacity-60">Delete guestbook messages</p>
        </Link>

        <button onClick={handleForceQuote} disabled={quoteLoading} className="manga-panel group hover:bg-black hover:text-white transition-all p-12 flex flex-col items-center justify-center space-y-4 disabled:opacity-50">
          <Quote size={64} className={quoteLoading ? "animate-spin" : "group-hover:scale-110 transition-transform"} />
          <span className="text-3xl font-black uppercase italic">{quoteLoading ? "Fetching..." : "New Quote"}</span>
          <p className="text-xs font-bold opacity-60">Force fetch a new daily quote</p>
          {quoteStatus === "success" && <p className="text-green-600 font-black text-sm uppercase">✓ New quote saved!</p>}
          {quoteStatus === "error" && <p className="text-red-600 font-black text-sm uppercase">✗ Failed to fetch quote</p>}
        </button>
      </div>
      
      <div className="manga-panel bg-zinc-900 text-white text-center py-4 text-xs font-black uppercase tracking-widest">
        System Node 01 // Secure Connection Active
      </div>
    </div>
  );
}
