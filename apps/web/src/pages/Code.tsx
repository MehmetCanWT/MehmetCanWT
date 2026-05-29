import { ArrowLeft, Terminal, Github, ExternalLink, Code2, Globe, Cpu, Music, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface Project {
  title: string;
  subtitle: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  tech: string[];
  icon: any;
  accentClass: string;
}

export default function Code() {
  const projects: Project[] = [
    {
      title: "ReframeGG",
      subtitle: "VIRAL VIDEO CONVERTER // TAURI + RUST ENGINE",
      description: "A premium, cross-platform desktop application that automatically transforms horizontal gameplay and cinematic videos into viral vertical formats (1080p, 720p, square) locally and instantly. Features custom mask cleanup, GPU-hardware acceleration options, and a magnetic pen snapping tool.",
      githubUrl: "https://github.com/MehmetCanWT/ReframeGG",
      tech: ["React 19", "Tauri v2", "Rust", "Tailwind v4", "FFmpeg Engine"],
      icon: Cpu,
      accentClass: "bg-pink-500 text-white dark:bg-pink-400 dark:text-black",
    },
    {
      title: "Spotify Valley",
      subtitle: "UNIVERSAL IN-GAME HUD // STARDEW VALLEY MOD",
      description: "A premium Stardew Valley mod that injects a beautiful Stardew-themed glassmorphic HUD overlay to control and display active music playback. Acts as a universal media controller supporting Spotify, iTunes, Apple Music, and Amazon Music, complete with high-res cover art matching and character normalization.",
      githubUrl: "https://github.com/MehmetCanWT/Spotify-Valley",
      tech: ["C#", "SMAPI", "Harmony", "iTunes API", "Game Modding"],
      icon: Music,
      accentClass: "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black",
    },
    {
      title: "MehmetCanWT",
      subtitle: "FULLSTACK MONOREPO ARCHIVE // PERSONAL PORTAL",
      description: "The fullstack engine behind this digital archive. Built onBun runtime and ElysiaJS, features a dual-layer in-memory and Redis cache, timing-safe credential comparisons, WebSocket-based live Discord presence telemetry via Lanyard, a daily quote module, and dynamic profile README SVG rendering.",
      githubUrl: "https://github.com/MehmetCanWT/MehmetCanWT",
      tech: ["React 19", "ElysiaJS", "Bun", "PostgreSQL", "Drizzle ORM", "Redis"],
      icon: Code2,
      accentClass: "bg-black text-white dark:bg-white dark:text-black",
    },
    {
      title: "History Wiper",
      subtitle: "PRIVACY FIRST OVERWATCH // BROWSER EXTENSION",
      description: "A modern browser extension built to safeguard digital privacy. Automatically clears target domains or keywords from local browser history at scheduled, custom intervals. Runs completely offline utilizing Manifest V3 alarms and chrome.history APIs, keeping your browsing data 100% local.",
      githubUrl: "https://github.com/MehmetCanWT/History-Wiper",
      tech: ["React 19", "TypeScript", "Tailwind v4", "Manifest V3", "Chrome APIs"],
      icon: Trash2,
      accentClass: "bg-violet-500 text-white dark:bg-violet-400 dark:text-black",
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SEO 
        title="Code Vault // MehmetCanWT" 
        description="Explore custom desktop apps, Stardew Valley mods, fullstack monorepos, and browser privacy extensions built by MehmetCanWT." 
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

      {/* Grid Layout for Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((project) => {
          const IconComponent = project.icon;
          const targetUrl = project.demoUrl || project.githubUrl;

          return (
            <div 
              key={project.title} 
              className="manga-panel flex flex-col justify-between h-full bg-white dark:bg-zinc-900 group"
            >
              {/* Card Body */}
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-4 border-black dark:border-white/20 pb-4">
                  <div className="space-y-1">
                    <span className={`manga-title text-xs font-black px-2 py-0.5 tracking-widest block w-max uppercase ${project.accentClass}`}>
                      {project.subtitle}
                    </span>
                    <h3 className="text-3xl font-black uppercase tracking-tight italic pt-1 group-hover:translate-x-[2px] transition-transform duration-200">
                      {project.title}
                    </h3>
                  </div>
                  <div className="border-4 border-black dark:border-white/20 p-2 bg-zinc-50 dark:bg-zinc-800">
                    <IconComponent size={28} className="text-black dark:text-white" />
                  </div>
                </div>

                {/* Description */}
                <p className="font-bold text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                  {project.description}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-2 pt-2 pb-4">
                  {project.tech.map((t) => (
                    <span 
                      key={t} 
                      className="border-2 border-black dark:border-white/20 px-2 py-0.5 text-xs font-bold uppercase bg-zinc-50 dark:bg-zinc-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer / Buttons */}
              <div className="border-t-4 border-black dark:border-white/20 pt-4 flex gap-4 mt-auto">
                <a 
                  href={targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 manga-panel flex items-center justify-center gap-2 font-black uppercase bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-zinc-900 dark:hover:text-white transition-all py-3 px-4 text-center cursor-pointer shadow-none hover:-translate-y-[2px]"
                >
                  {project.demoUrl ? <Globe size={18} /> : <Github size={18} />}
                  {project.demoUrl ? "Launch App" : "View Code"}
                  <ExternalLink size={14} className="opacity-75" />
                </a>

                {project.demoUrl && (
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="manga-panel flex items-center justify-center p-3 border-4 border-black dark:border-white/20 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-none"
                    aria-label="GitHub Repository"
                  >
                    <Github size={20} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}