import { useState } from 'react';
import { ShieldCheck, BookOpen, Gamepad2, MessageSquare, Quote, LayoutDashboard, LogOut, RotateCcw, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { apiPost } from '../../lib/api';

export default function AdminIndex() {
  const { isAuth, setAuth, logout } = useStore();
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<"idle" | "success" | "error">("idle");

  const [freshLoading, setFreshLoading] = useState(false);
  const [freshResult, setFreshResult] = useState<{
    success: boolean;
    message: string;
    summary?: {
      animeCount: number;
      gamesCount: number;
      steamUser: string;
      steamLevel: number;
      quoteCharacter: string;
    };
  } | null>(null);

  const handleAuth = async () => {
    if (!pass) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost<{ success?: boolean; error?: string }>('/api/admin/login', { password: pass });
      if (data && data.success) {
        setAuth(true);
      } else {
        setError(data?.error || "Authentication failed.");
      }
    } catch (e: any) {
      setError(e?.message || "Invalid credentials. Try again.");
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
    } catch {
      setQuoteStatus("error");
      setTimeout(() => setQuoteStatus("idle"), 3000);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleForceFreshData = async () => {
    setFreshLoading(true);
    setFreshResult(null);
    try {
      const data = await apiPost<{
        success: boolean;
        message: string;
        summary?: {
          animeCount: number;
          gamesCount: number;
          steamUser: string;
          steamLevel: number;
          quoteCharacter: string;
        };
      }>('/api/admin/fresh-data', {});

      if (data && data.success) {
        setFreshResult({
          success: true,
          message: data.message || "Tüm önbellek sıfırlandı ve en güncel veriler çekildi.",
          summary: data.summary,
        });
      } else {
        setFreshResult({
          success: false,
          message: "Yenileme sırasında hata oluştu.",
        });
      }
    } catch (e: any) {
      setFreshResult({
        success: false,
        message: e?.message || "Sunucu bağlantı hatası.",
      });
    } finally {
      setFreshLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-4">
        <div className="manga-panel w-full max-w-md space-y-5 bg-white dark:bg-zinc-900 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
          <div className="flex justify-center text-black dark:text-white">
            <div className="p-3 bg-yellow-400 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
              <ShieldCheck size={48} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="manga-title text-2xl w-full">ADMIN ACCESS</h1>
            <p className="text-xs font-bold text-zinc-500 uppercase mt-1">NODE 01 SECURE TERMINAL</p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-950 border-3 border-red-600 p-3 text-red-700 dark:text-red-400 font-black uppercase text-xs text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {error}
            </div>
          )}

          <label htmlFor="admin-password" className="sr-only">Access Code</label>
          <input 
            id="admin-password"
            type="password" 
            placeholder="ACCESS CODE (1597532486)" 
            className="w-full border-3 border-black dark:border-white/30 p-3 font-black uppercase focus:bg-zinc-100 dark:focus:bg-zinc-800 outline-none bg-white dark:bg-zinc-900 dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm tracking-wider"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            disabled={loading}
          />
          <button 
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-black text-white dark:bg-white dark:text-black p-3.5 font-black uppercase hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            {loading ? "AUTHENTICATING..." : "AUTHORIZE TERMINAL"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <LayoutDashboard size={20} /> Back to Archive
        </Link>
        <div className="flex items-center gap-4">
          <div className="manga-title text-2xl sm:text-3xl italic uppercase">Admin Terminal</div>
          <button
            onClick={logout}
            className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 text-red-600 hover:bg-red-600 hover:text-white transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Prominent FORCE FRESH DATA Banner Card */}
      <div className="manga-panel p-6 sm:p-8 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap size={24} className="fill-black" />
              <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight">FORCE FRESH DATA // 0'DAN YENİLE</h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-black/80">
              Tüm Steam, AniList ve Günün Sözü önbelleğini temizler, doğrudan canlı kaynaklardan 100% taze veriyi çeker.
            </p>
          </div>

          <button
            onClick={handleForceFreshData}
            disabled={freshLoading}
            className="manga-panel font-black uppercase px-6 py-3.5 bg-black text-white hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-2 text-sm shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <RotateCcw size={18} className={freshLoading ? "animate-spin text-yellow-400" : ""} />
            <span>{freshLoading ? "VERİLER YENİLENİYOR..." : "ANINDA FRESH DATA"}</span>
          </button>
        </div>

        {freshResult && (
          <div className={`p-4 border-2 border-black ${freshResult.success ? "bg-white" : "bg-red-100"} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2`}>
            <div className="flex items-center gap-2 font-black text-sm uppercase">
              {freshResult.success ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-600" />}
              <span>{freshResult.message}</span>
            </div>
            {freshResult.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-300 font-mono text-xs">
                <div><span className="text-zinc-500">STEAM USER:</span> <strong>{freshResult.summary.steamUser} (LVL {freshResult.summary.steamLevel})</strong></div>
                <div><span className="text-zinc-500">STEAM GAMES:</span> <strong>{freshResult.summary.gamesCount}</strong></div>
                <div><span className="text-zinc-500">ANIME ENTRIES:</span> <strong>{freshResult.summary.animeCount}</strong></div>
                <div><span className="text-zinc-500">QUOTE HERO:</span> <strong>{freshResult.summary.quoteCharacter}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid of Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/admin/anime" className="manga-panel group hover:bg-black hover:text-white transition-all p-8 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-zinc-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          <BookOpen size={48} className="group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black uppercase italic">Manage Anime</span>
          <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Pin and filter your anime archive</p>
        </Link>

        <Link to="/admin/games" className="manga-panel group hover:bg-black hover:text-white transition-all p-8 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-zinc-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          <Gamepad2 size={48} className="group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black uppercase italic">Manage Games</span>
          <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Pin and reorder Steam missions</p>
        </Link>

        <Link to="/admin/guestbook" className="manga-panel group hover:bg-black hover:text-white transition-all p-8 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-zinc-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
          <MessageSquare size={48} className="group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black uppercase italic">Manage Logs</span>
          <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Review and delete guestbook messages</p>
        </Link>

        <button onClick={handleForceQuote} disabled={quoteLoading} className="manga-panel group hover:bg-black hover:text-white transition-all p-8 flex flex-col items-center justify-center space-y-3 disabled:opacity-50 bg-white dark:bg-zinc-900 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] cursor-pointer text-left sm:text-center w-full">
          <Quote size={48} className={quoteLoading ? "animate-spin text-yellow-400" : "group-hover:scale-110 transition-transform"} />
          <span className="text-2xl font-black uppercase italic">{quoteLoading ? "Fetching..." : "Rotate Quote"}</span>
          <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">Force fetch new daily quote & characters</p>
          {quoteStatus === "success" && <p className="text-emerald-500 font-black text-xs uppercase">✓ New quote saved!</p>}
          {quoteStatus === "error" && <p className="text-red-500 font-black text-xs uppercase">✗ Failed to fetch quote</p>}
        </button>
      </div>
      
      <div className="manga-panel bg-black text-white text-center py-3 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        MEHMETCANWT ARCHIVE // SYSTEM NODE 01 // SECURE CONNECTION ACTIVE
      </div>
    </div>
  );
}
