import { ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Code() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SEO 
        title="Code Vault // MehmetCanWT" 
        description="Work in progress code and development archive." 
        url="https://mehmetcanwt.xyz/code"
      />
      
      <header className="flex justify-between items-center">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
          <Terminal size={28} /> Code Vault
        </div>
      </header>

      <div className="manga-panel flex flex-col items-center justify-center py-32 space-y-8 bg-zinc-50 halftone relative">
        <div className="relative z-10 text-7xl sm:text-9xl font-black">
          ฅ/ᐠ. ̫ .ᐟ\ฅ
        </div>
        <div className="relative z-10 text-center space-y-4 bg-white p-6 border-4 border-black">
          <h2 className="text-4xl sm:text-6xl font-black uppercase italic">W.I.P.</h2>
          <p className="font-bold text-gray-600 uppercase tracking-widest text-lg sm:text-xl border-t-2 border-black pt-2">
            ERROR 404: KEDİ UYUYOR // MODULE UNDER CONSTRUCTION
          </p>
          <p className="font-bold text-sm text-gray-400 uppercase italic">
            Check back later for development logs, project repos, and open-source contributions.
          </p>
        </div>
      </div>
    </div>
  );
}