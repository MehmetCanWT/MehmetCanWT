import { useEffect, useState, useMemo, useRef } from 'react';
import { Gamepad2, ArrowLeft, Star, Search, Clock, ExternalLink, Video, VideoOff, Trophy, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import type { SteamGame, SteamProfile, GamesResponse } from '../types';

interface GamesPageData {
  profile?: SteamProfile;
  allGames: SteamGame[];
  pinnedIds: number[];
}

const DEFAULT_PROFILE: SteamProfile = {
  steamid: "76561198200466026",
  personaname: "FemboyMemo",
  avatar: "https://shared.akamai.steamstatic.com/community_assets/images/items/1385730/b2bba5dcd8e2942ec5ba7639ea6622753e6005ad.gif",
  avatarframe: "https://shared.fastly.steamstatic.com/community_assets/images/items/527230/18ec71cb7da1182d32164890bac8411a09e26e46.png",
  level: 54,
  totalHours: 8901,
  accountValueUsd: 585,
  backgroundVideoWebm: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/7890df00a25ba9bbb8947df4205e04c88006852b.webm",
  backgroundVideoMp4: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/8225c97a6365c6fefdd41afc76012c1e117fa3a2.mp4",
  backgroundPoster: "https://shared.akamai.steamstatic.com/community_assets/images/items/2070850/468af81383083392a90b6434813cbd741c3da7cf.jpg",
  lastUpdated: new Date().toISOString(),
};

const INITIAL_GAMES: SteamGame[] = [
  {
    appid: 346110,
    name: "ARK: Survival Evolved",
    playtime_forever: 110640,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/capsule_184x69.jpg",
  },
  {
    appid: 730,
    name: "Counter-Strike 2",
    playtime_forever: 46680,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/capsule_184x69.jpg",
  },
  {
    appid: 1030300,
    name: "Hollow Knight: Silksong",
    playtime_forever: 42,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/capsule_184x69.jpg",
  },
  {
    appid: 413150,
    name: "Stardew Valley",
    playtime_forever: 19800,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/413150/capsule_184x69.jpg",
  },
  {
    appid: 252490,
    name: "Rust",
    playtime_forever: 14700,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/capsule_184x69.jpg",
  },
  {
    appid: 1245620,
    name: "ELDEN RING",
    playtime_forever: 12600,
    img_icon_url: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_184x69.jpg",
  },
];

export default function Games() {
  const [data, setData] = useState<GamesPageData>({
    profile: DEFAULT_PROFILE,
    allGames: INITIAL_GAMES,
    pinnedIds: [346110, 730],
  });
  const [search, setSearch] = useState('');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/games');
        if (res.ok) {
          const responseData = (await res.json()) as GamesResponse;
          const gamesList = Array.isArray(responseData?.allGames) && responseData.allGames.length > 0
            ? responseData.allGames
            : INITIAL_GAMES;
          const pinnedIds = Array.isArray(responseData?.pinnedIds) ? responseData.pinnedIds : [346110, 730];
          const profile = responseData?.profile || DEFAULT_PROFILE;

          const sorted = [...gamesList].sort((a, b) => {
            const isPinnedA = pinnedIds.includes(a.appid);
            const isPinnedB = pinnedIds.includes(b.appid);
            if (isPinnedA && !isPinnedB) return -1;
            if (!isPinnedA && isPinnedB) return 1;
            return b.playtime_forever - a.playtime_forever;
          });

          setData({ profile, allGames: sorted, pinnedIds });
        }
      } catch (e) {
        console.error('Failed to fetch live steam games data:', e);
      }
    }
    fetchData();
  }, []);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const filteredGames = useMemo(() => {
    if (!search.trim()) return data.allGames;
    const q = search.toLowerCase();
    return data.allGames.filter((g) => g.name.toLowerCase().includes(q));
  }, [data.allGames, search]);

  const profile = data.profile || DEFAULT_PROFILE;

  return (
    <div className="relative min-h-screen">
      {/* Animated Steam Profile Background Video (Steam Points Shop special theme) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {profile.backgroundVideoMp4 && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={profile.backgroundPoster}
            className="w-full h-full object-cover opacity-25 dark:opacity-35 scale-105 filter blur-[1px] transition-opacity duration-1000"
          >
            <source src={profile.backgroundVideoWebm} type="video/webm" />
            <source src={profile.backgroundVideoMp4} type="video/mp4" />
          </video>
        )}
        {/* Soft atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-zinc-100/95 to-white/95 dark:from-zinc-950/85 dark:via-zinc-950/90 dark:to-zinc-950/95 backdrop-blur-[2px]" />
      </div>

      {/* Main Content Interface */}
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
        <SEO
          title="Game Vault // FemboyMemo"
          description="Live Steam library, hours played, and profile telemetry with animated background."
          url="https://mehmetcanwt.xyz/games"
        />

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            to="/"
            className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-900"
          >
            <ArrowLeft size={20} /> Back
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={toggleVideo}
              className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-3 text-xs bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all"
              title={isVideoPlaying ? "Pause animated background" : "Play animated background"}
            >
              {isVideoPlaying ? <Video size={14} className="text-emerald-500 animate-pulse" /> : <VideoOff size={14} className="text-zinc-500" />}
              <span>{isVideoPlaying ? "LIVE BG ON" : "BG PAUSED"}</span>
            </button>

            <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
              <Gamepad2 size={28} /> Game Vault
            </div>
          </div>
        </header>

        {/* Steam Profile Hero Showcase Card (SteamDB / Steam Community Data) */}
        <div className="manga-panel relative overflow-hidden bg-white/95 dark:bg-zinc-900/95 p-6 sm:p-8 border-3 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)] backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Avatar with Animated Steam Frame */}
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.personaname}
                  className="w-full h-full object-cover border-3 border-black dark:border-white/30 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
                {profile.avatarframe && (
                  <img
                    src={profile.avatarframe}
                    alt="Steam Avatar Frame"
                    className="absolute -top-3.5 -left-3.5 w-[128%] h-[128%] pointer-events-none scale-105"
                  />
                )}
              </div>

              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                  <span className="text-xs font-black uppercase bg-purple-600 text-white px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                    <User size={12} /> STEAM PROFILE
                  </span>
                  <span className="text-xs font-black uppercase bg-yellow-400 text-black px-2 py-0.5 border border-black font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    LVL {profile.level}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-black dark:text-white">
                  {profile.personaname}
                </h2>
                <p className="text-xs font-mono font-bold text-zinc-500">
                  STEAM ID: {profile.steamid} // TURKEY 🇹🇷
                </p>
              </div>
            </div>

            {/* Steam Stats Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="manga-panel p-3 bg-zinc-50 dark:bg-zinc-800/80 border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-2xl sm:text-3xl font-black italic text-black dark:text-white leading-none">
                  {profile.totalHours.toLocaleString()}h
                </p>
                <p className="text-[10px] font-black uppercase text-zinc-500 mt-1 flex items-center justify-center gap-1">
                  <Clock size={10} /> Hours on Record
                </p>
              </div>

              <div className="manga-panel p-3 bg-zinc-50 dark:bg-zinc-800/80 border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-2xl sm:text-3xl font-black italic text-emerald-500 leading-none">
                  ${profile.accountValueUsd || 585}
                </p>
                <p className="text-[10px] font-black uppercase text-zinc-500 mt-1 flex items-center justify-center gap-1">
                  <Trophy size={10} /> SteamDB Value
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 manga-panel p-3 bg-zinc-50 dark:bg-zinc-800/80 border-2 border-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center">
                <a
                  href={`https://steamcommunity.com/profiles/${profile.steamid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:bg-amber-400 hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span>COMMUNITY</span>
                  <ExternalLink size={12} />
                </a>
                <span className="text-[9px] font-mono text-zinc-400 mt-1">11.4 YEARS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="manga-panel p-3 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] bg-white/95 dark:bg-zinc-900/95 flex items-center gap-3 backdrop-blur-sm">
          <Search size={20} className="text-zinc-500 shrink-0 ml-1" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH MISSIONS (E.G. ARK, COUNTER-STRIKE 2, SILKSONG, RUST)..."
            className="w-full bg-transparent outline-none font-bold uppercase text-sm tracking-wider text-black dark:text-white placeholder:text-zinc-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs font-black uppercase px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Grid: Vibrant Full-Color Game Cards (NO GRAYSCALE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const isPinned = data.pinnedIds.includes(game.appid);
            const hours = Math.round(game.playtime_forever / 60);

            return (
              <div
                key={game.appid}
                className={`manga-panel relative group overflow-hidden border-3 border-black p-4 transition-all duration-300 hover:-translate-y-1.5 ${
                  isPinned
                    ? "bg-amber-50/95 dark:bg-amber-950/40 border-amber-500 shadow-[5px_5px_0px_0px_rgba(245,158,11,1)]"
                    : "bg-white/95 dark:bg-zinc-900/95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                }`}
              >
                <div className="relative z-10 flex flex-col h-full">
                  {/* Full-Color Vivid Steam Header Image (NO GRAYSCALE) */}
                  <div className="relative aspect-video border-2 border-black dark:border-white/30 mb-3 overflow-hidden bg-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <img
                      loading="lazy"
                      src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {isPinned && (
                      <div className="absolute top-2 left-2 bg-amber-400 text-black px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Star size={12} className="fill-black" />
                        <span>TOP MISSION</span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5 border border-zinc-700">
                      APP {game.appid}
                    </div>
                  </div>

                  {/* Playtime stats */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1">
                      <Clock size={11} /> RECORDED PLAYTIME
                    </span>
                    <span className="text-3xl font-black italic tracking-tighter text-black dark:text-white leading-none font-mono">
                      {hours.toLocaleString()}H
                    </span>
                  </div>

                  {/* Title & Actions */}
                  <div className="mt-auto border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                    <h3 className="font-black text-xl uppercase italic leading-tight line-clamp-1 text-black dark:text-white">
                      {game.name}
                    </h3>
                    <div className="mt-2.5 flex items-center justify-between text-xs font-bold uppercase">
                      <span className="text-emerald-500 flex items-center gap-1 text-[11px] font-black">
                        <ShieldCheck size={13} /> {hours >= 500 ? "MASTERED" : hours >= 50 ? "VETERAN" : "DEPLOYED"}
                      </span>
                      <a
                        href={`https://steamcommunity.com/app/${game.appid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-zinc-500 hover:text-black dark:hover:text-white transition-colors underline text-[11px] font-black"
                      >
                        <span>STORE / HUB</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
