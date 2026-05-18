import { useState } from 'react';
import { LayoutDashboard, BookOpen, Gamepad2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export default function AdminIndex() {
  const { isAuth, setAuth } = useStore();
  const [pass, setPass] = useState("");

  const handleAuth = () => {
    if (pass === "159753") {
      setAuth(true);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="manga-panel w-full max-w-md space-y-4">
          <div className="flex justify-center mb-4 text-black">
            <ShieldCheck size={64} />
          </div>
          <h1 className="manga-title text-2xl w-full text-center">ADMIN ACCESS</h1>
          <input 
            type="password" 
            placeholder="ACCESS CODE" 
            className="w-full border-4 border-black p-3 font-black uppercase focus:bg-zinc-100 outline-none"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
          />
          <button 
            onClick={handleAuth}
            className="w-full bg-black text-white p-3 font-black uppercase hover:bg-zinc-800 transition-colors"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 hover:bg-black hover:text-white transition-all">
          <LayoutDashboard size={20} /> Home
        </Link>
        <div className="manga-title text-3xl italic uppercase">Admin Terminal</div>
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
      </div>
      
      <div className="manga-panel bg-zinc-900 text-white text-center py-4 text-xs font-black uppercase tracking-widest">
        System Node 01 // Secure Connection Active
      </div>
    </div>
  );
}
