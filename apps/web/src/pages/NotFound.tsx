import { ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SEO 
        title="404 // MehmetCanWT" 
        description="Page not found in the archive." 
      />
      
      <header className="flex justify-between items-center">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back to Base
        </Link>
      </header>

      <div className="manga-panel flex flex-col items-center justify-center py-32 space-y-8 bg-zinc-50 dark:bg-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 halftone opacity-10"></div>
        <div className="relative z-10 text-7xl sm:text-9xl font-black">
          <Terminal size={120} className="mx-auto mb-4" />
        </div>
        <div className="relative z-10 text-center space-y-4 bg-white dark:bg-zinc-900 p-6 border-4 border-black dark:border-white/20">
          <h2 className="text-4xl sm:text-6xl font-black uppercase italic">404</h2>
          <p className="font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest text-lg sm:text-xl border-t-2 border-black dark:border-white/20 pt-2">
            ERROR: PAGE NOT FOUND IN ARCHIVE
          </p>
          <p className="font-bold text-sm text-gray-400 uppercase italic">
            The requested node does not exist in this system.
          </p>
        </div>
      </div>
    </div>
  );
}
