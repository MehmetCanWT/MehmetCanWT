import { useEffect, useState } from 'react';
import { BookOpen, Gamepad2, MessageSquare, Radio, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/eden';
import GuestbookForm from '../components/GuestbookForm';

export default function Home() {
  const [data, setData] = useState<any>(null);

  const fetchGuestbook = async () => {
    const guestbookRes = await api.api.guestbook.get();
    setData((prev: any) => ({ ...prev, guestbook: guestbookRes.data || [] }));
  };

  useEffect(() => {
    async function fetchData() {
      const [animeRes, gameRes, newsRes, discordRes, guestbookRes, quoteRes] = await Promise.all([
        api.api.anime.get(),
        api.api.games.get(),
        api.api.news.get(),
        api.api.discord.get(),
        api.api.guestbook.get(),
        api.api.quote.get()
      ]);
      
      setData({
        favoriteAnime: animeRes.data?.allAnime.find((a: any) => a.id === 21) || animeRes.data?.allAnime[0],
        topGame: [...(gameRes.data?.allGames || [])].sort((a: any, b: any) => b.playtime_forever - a.playtime_forever)[0],
        news: newsRes.data || [],
        discord: discordRes.data,
        guestbook: guestbookRes.data || [],
        dailyQuote: quoteRes.data || { quote: "Loading...", character: "System", anime: "Archive" }
      });
    }
    fetchData();
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center font-black uppercase italic text-4xl animate-pulse">Initializing System...</div>;

  const { favoriteAnime, topGame, news, discord, guestbook, dailyQuote } = data;

  const birthDate = new Date("2004-10-03");
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header Panel */}
      <header className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 manga-panel flex flex-col justify-center items-center xl:items-start text-center xl:text-left overflow-hidden">
          <h1 className="text-[14vw] sm:text-[10vw] md:text-7xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            Mehmet<span className="bg-black text-white px-1 sm:px-2 ml-1">Can</span>WT
          </h1>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 border-t-4 border-black pt-2 w-full justify-center xl:justify-start">
            <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-center">
              Personal Terminal // Node 01
            </p>
            <span className="hidden sm:block text-black/20 text-2xl font-black">/</span>
            <div className="bg-black text-white px-3 py-1 text-sm font-black italic uppercase inline-block">
              Level {age} Human
            </div>
          </div>
        </div>
        <nav className="manga-panel bg-black text-white flex flex-col items-center justify-center space-y-2 sm:space-y-4 py-6 sm:py-0">
           <Link to="/anime" className="text-xl sm:text-2xl font-black italic uppercase hover:text-purple-400 transition-colors flex items-center gap-2 w-full justify-center border-b border-white/20 pb-2">
             <BookOpen size={20} /> Anime List
           </Link>
           <Link to="/games" className="text-xl sm:text-2xl font-black italic uppercase hover:text-pink-400 transition-colors flex items-center gap-2 w-full justify-center">
             <Gamepad2 size={20} /> Game Vault
           </Link>
        </nav>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Quote */}
          <section className="space-y-4">
            <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
              <Quote size={20} /> DAILY INSPIRATION
            </div>
            <div className="manga-panel relative overflow-hidden bg-white p-6 sm:p-8">
              <div className="absolute inset-0 halftone opacity-10"></div>
              <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="flex-shrink-0 relative w-24 h-24 sm:w-32 sm:h-32 aspect-square">
                  <div className="w-full h-full border-4 border-black overflow-hidden bg-zinc-100 relative">
                    {dailyQuote.characterImage ? (
                      <img src={dailyQuote.characterImage} alt={dailyQuote.character} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-4xl">?</div>
                    )}
                  </div>
                  {dailyQuote.animeImage && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 border-4 border-black overflow-hidden bg-zinc-100 rounded-2xl">
                      <img src={dailyQuote.animeImage} alt={dailyQuote.anime} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xl sm:text-2xl font-black italic uppercase leading-snug">
                    &quot;{dailyQuote.quote}&quot;
                  </p>
                  <div className="mt-4 inline-flex flex-col items-center sm:items-start">
                    <span className="bg-black text-white px-3 py-1 font-black text-sm sm:text-base uppercase tracking-widest">
                      {dailyQuote.character}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase mt-1">
                      IN // {dailyQuote.anime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Favorite Anime Highlight */}
            <section className="space-y-4">
              <div className="manga-title text-xl sm:text-2xl">FAVORITE SELECTION</div>
              {favoriteAnime ? (
                <div className="manga-panel relative group overflow-hidden bg-zinc-100 min-h-[250px] sm:min-h-[300px] block cursor-default outline-none">
                  <div className="absolute inset-0 halftone opacity-20"></div>
                  <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:gap-6 h-full">
                    <div className="w-full sm:w-1/3 aspect-[3/4] border-4 border-black overflow-hidden flex-shrink-0 relative">
                      <img
                        src={favoriteAnime.coverImage.large}
                        alt={favoriteAnime.title.english || "Favorite Anime"}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div>
                        <h3 className="text-3xl sm:text-4xl font-black uppercase leading-tight italic line-clamp-2">{favoriteAnime.title.english || favoriteAnime.title.romaji}</h3>
                        <p className="mt-2 font-bold text-gray-600 uppercase tracking-tighter text-sm">Ultimate Favorited Selection</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-6xl sm:text-8xl font-black text-black/5 select-none pointer-events-none uppercase whitespace-nowrap overflow-hidden max-w-full text-ellipsis">
                    {favoriteAnime.title.english || favoriteAnime.title.romaji}
                  </div>
                </div>
              ) : (
                <div className="manga-panel">Loading...</div>
              )}
            </section>

            {/* Top Game Highlight */}
            <section className="space-y-4">
              <div className="manga-title text-xl sm:text-2xl">MOST PLAYED MISSION</div>
              {topGame ? (
                <div className="manga-panel relative group overflow-hidden bg-zinc-100 min-h-[250px] sm:min-h-[300px] block cursor-default outline-none">
                  <div className="absolute inset-0 halftone opacity-20"></div>
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="w-full sm:w-1/2 aspect-video border-4 border-black overflow-hidden bg-black shrink-0 relative">
                        <img
                          src={`https://cdn.akamai.steamstatic.com/steam/apps/${topGame.appid}/header.jpg`}
                          alt={topGame.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <div className="text-left sm:text-right flex-1 w-full border-b-4 sm:border-b-0 border-black pb-2 sm:pb-0">
                        <p className="text-4xl sm:text-5xl font-black italic tracking-tighter leading-none">{(topGame.playtime_forever / 60).toFixed(0)}H</p>
                        <p className="font-bold uppercase text-xs">Total Playtime</p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:border-t-4 border-black pt-4">
                       <h3 className="text-3xl sm:text-4xl font-black uppercase italic leading-none line-clamp-1">{topGame.name}</h3>
                       <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                          <p className="font-bold text-gray-600 uppercase tracking-widest text-xs sm:text-sm">Status: Mastered</p>
                       </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-10 text-6xl sm:text-8xl font-black text-black/5 select-none pointer-events-none uppercase whitespace-nowrap overflow-hidden max-w-full text-ellipsis">
                    {topGame.name}
                  </div>
                </div>
              ) : (
                <div className="manga-panel">Loading...</div>
              )}
            </section>
          </div>

          {/* Guestbook Section */}
          <section className="space-y-4">
            <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
              <MessageSquare size={20} /> SYSTEM LOGS // GUESTBOOK
            </div>
            <div className="manga-panel space-y-6">
              <GuestbookForm onSuccess={fetchGuestbook} />
              <div className="border-t-4 border-black pt-4 space-y-4">
                {guestbook.length > 0 ? (
                  guestbook.map((entry: any) => (
                    <div key={entry.id} className="border-l-4 border-black pl-4 py-1">
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
                  ))
                ) : (
                  <p className="font-bold italic text-gray-400">NO LOGS FOUND. BE THE FIRST TO POST.</p>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">

          {/* Discord Status Panel */}
          <section className="space-y-4">
            <div className="manga-title text-xl sm:text-2xl flex items-center gap-2">
              <Radio size={20} className="animate-pulse" /> LIVE TELEMETRY
            </div>
            <div className="manga-panel bg-zinc-50">
              {discord ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b-4 border-black pb-4">
                    <div className="relative flex-shrink-0">
                      <img
                        loading="lazy"
                        src={`https://cdn.discordapp.com/avatars/${discord.discord_user.id}/${discord.discord_user.avatar}.png`}
                        alt="Avatar"
                        className="border-4 border-black w-16 h-16"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-black rounded-full ${
                        discord.discord_status === 'online' ? 'bg-green-500' :
                        discord.discord_status === 'dnd' ? 'bg-red-500' :
                        discord.discord_status === 'idle' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase italic text-xl">{discord.discord_user.username}</h4>
                      <p className="text-xs font-bold text-gray-500 uppercase">STATUS: {discord.discord_status}</p>
                    </div>
                  </div>

                  {/* Activity Detail */}
                  {discord.activities.filter((a: any) => a.type !== 4).map((activity: any, i: number) => (
                    <div key={i} className="bg-white border-2 border-black p-3 space-y-2">
                      <p className="text-[10px] font-black bg-black text-white inline-block px-1 italic uppercase">
                        {activity.type === 0 ? 'PLAYING' : activity.type === 2 ? 'LISTENING' : 'ACTIVITY'}
                      </p>
                      <div className="flex gap-3">
                        {activity.assets?.large_image && (
                          <img
                            loading="lazy"
                            src={activity.assets.large_image.startsWith('mp:external')
                              ? activity.assets.large_image.replace(/mp:external\/.*\/https\//, 'https://')
                              : `https://cdn.discordapp.com/app-assets/${activity.application_id || activity.id}/${activity.assets.large_image}.png`}
                            className="border-2 border-black flex-shrink-0 w-12 h-12"
                            alt="Activity"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-sm uppercase truncate italic">{activity.name}</p>
                          <p className="text-[10px] font-bold text-gray-600 uppercase truncate">{activity.details}</p>
                          <p className="text-[10px] font-bold text-gray-600 uppercase truncate">{activity.state}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Spotify */}
                  {discord.spotify && (
                    <div className="bg-green-50 border-2 border-green-600 p-3 space-y-2">
                       <p className="text-[10px] font-black bg-green-600 text-white inline-block px-1 italic uppercase">SPOTIFY TRANSMISSION</p>
                       <div className="flex gap-3">
                          <img
                            loading="lazy"
                            src={discord.spotify.album_art_url}
                            className="border-2 border-green-600 flex-shrink-0 w-12 h-12"
                            alt="Spotify"
                          />
                          <div className="min-w-0">
                            <p className="font-black text-sm uppercase truncate text-green-800 italic">{discord.spotify.song}</p>
                            <p className="text-[10px] font-bold text-green-700 uppercase truncate">BY {discord.spotify.artist}</p>
                          </div>
                       </div>
                    </div>
                  )}

                  {!discord.activities.some((a: any) => a.type !== 4) && !discord.spotify && (
                    <p className="text-xs font-bold italic text-gray-400 uppercase text-center py-4">NO ACTIVE TRANSMISSIONS FOUND</p>
                  )}
                </div>
              ) : (
                <p className="text-center italic font-bold">LINKING TO DISCORD...</p>
              )}
            </div>
            <div className="text-[10px] font-black uppercase text-right text-gray-400">
              *UPDATES EVERY 30 SECONDS
            </div>
          </section>

          {/* Quick Stats / Identity */}
          <section className="manga-panel bg-black text-white p-4">
             <h4 className="font-black italic uppercase border-b border-white/20 mb-2 pb-1 text-sm">IDENTITY_VERIFIED</h4>
             <div className="space-y-1 text-[10px] font-bold font-mono">
                <p>LOCATION: TURKIYE</p>
                <p>ROLE: FULLSTACK_RENEGADE</p>
                <p>STATUS: EVOLVING</p>
                <p>UPLINK: ACTIVE</p>
             </div>
          </section>

        </div>
      </div>

      {/* Breaking News Ticker */}
      <footer className="fixed bottom-0 left-0 w-full bg-black border-t-4 border-black h-16 flex items-center overflow-hidden z-50">
        <div className="bg-red-600 text-white font-black italic px-4 py-full h-full flex items-center shrink-0 z-10 border-r-4 border-black shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]">
          BREAKING NEWS
        </div>
        <div className="flex whitespace-nowrap animate-manga-scroll text-white font-bold tracking-tight text-xl uppercase items-center">
          {news.map((item: any, i: number) => (
            <span key={i} className="mx-8 flex items-center gap-2">
              <span className="text-red-500 font-black">●</span>
              {item.title} 
              <span className="text-xs bg-white text-black px-1 font-black ml-2">[{item.source}]</span>
            </span>
          ))}
          {/* Loop for infinite feel */}
          {news.map((item: any, i: number) => (
            <span key={`loop-${i}`} className="mx-8 flex items-center gap-2">
              <span className="text-red-500 font-black">●</span>
              {item.title} 
              <span className="text-xs bg-white text-black px-1 font-black ml-2">[{item.source}]</span>
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}