import Link from 'next/link';
import { FiHome, FiSettings, FiLogOut } from 'react-icons/fi';

export default function SettingsPage() {
  return (
    <main className="min-h-screen flex flex-col p-4 relative overflow-hidden bg-[#0a0a0f]">
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0f] to-[#0a0a0f]"></div>
      
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white font-outfit flex items-center gap-3">
            <FiSettings className="text-purple-400" />
            Dashboard
          </h1>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition flex items-center gap-2">
              <FiHome /> Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Profile Configuration</h2>
            <p className="text-gray-400 mb-4 text-sm">Update your public profile information, social links, and bio.</p>
            <button className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition">
              Edit Profile
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Music Integration</h2>
            <p className="text-gray-400 mb-4 text-sm">Configure Spotify API tokens and Apple Music embed URLs.</p>
            <button className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition">
              Manage Music
            </button>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Anime List Sync</h2>
            <p className="text-gray-400 mb-4 text-sm">Trigger manual sync with your Anilist/MAL account.</p>
            <button className="px-4 py-2 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-lg hover:bg-pink-500/30 transition">
              Sync Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
