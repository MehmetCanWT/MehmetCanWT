import { useEffect, useState } from 'react';
import { ArrowLeft, Terminal, ExternalLink, Star, Code2, Cpu, Music, Shield, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Github = (props: { size?: number; className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={props.size || 24} 
    height={props.size || 24} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={props.className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface RawGithubRepo {
  name: string;
  stargazers_count: number;
  description: string | null;
  language: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  fork: boolean;
  updated_at: string;
}

interface ProjectDisplay {
  title: string;
  subtitle: string;
  description: string;
  stars: number;
  githubUrl: string;
  demoUrl?: string;
  tech: string[];
  iconKey?: string;
  accentClass: string;
}

const ICON_MAP: Record<string, any> = {
  cpu: Cpu,
  terminal: Terminal,
  shield: Shield,
  music: Music,
  code: Code2,
};

function resolveIcon(iconKey?: string) {
  if (iconKey && ICON_MAP[iconKey]) {
    return ICON_MAP[iconKey];
  }
  return Code2;
}

// Curated metadata enhancements for known repositories
const KNOWN_ENHANCEMENTS: Record<string, Partial<ProjectDisplay>> = {
  OpeNitro: {
    subtitle: "NITROSENSE FOR LINUX // SYSTEM UTILITY",
    description: "An advanced Linux utility bringing Acer NitroSense fan control, power plans, and hardware thermal management to Linux gaming environments.",
    tech: ["Python", "Linux Kernel", "GTK", "Hardware Telemetry"],
    iconKey: "cpu",
    accentClass: "bg-red-500 text-white dark:bg-red-400 dark:text-black",
  },
  rustfetch: {
    subtitle: "BLAZING-FAST SYSTEM INFO FETCH // PURE RUST",
    description: "Ultra-fast (~4ms execution time) and memory-safe Linux system information fetch tool written in pure Rust with zero bloat and crisp ASCII aesthetics.",
    tech: ["Rust", "Systems Programming", "CLI", "Linux API"],
    iconKey: "terminal",
    accentClass: "bg-orange-500 text-white dark:bg-orange-400 dark:text-black",
  },
  "WT-Dots": {
    subtitle: "PERSONAL DOTFILES & LINUX WORKSPACE",
    description: "Curated dotfiles, Hyprland/Wayland window management configurations, custom shell prompts, and high-performance developer workflows.",
    tech: ["Rust", "Shell Scripting", "Hyprland", "Linux"],
    iconKey: "shield",
    accentClass: "bg-purple-500 text-white dark:bg-purple-400 dark:text-black",
  },
  JunimoJams: {
    subtitle: "UNIVERSAL IN-GAME HUD // STARDEW VALLEY MOD",
    description: "A premium Stardew Valley mod injecting an interactive glassmorphic HUD overlay to control and display active music playback with high-res cover art matching.",
    tech: ["C#", "SMAPI", "Harmony", "Game Modding"],
    iconKey: "music",
    accentClass: "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-black",
  },
  MehmetCanWT: {
    subtitle: "FULLSTACK MONOREPO ARCHIVE // NETLIFY + REACT 19",
    description: "The fullstack digital engine behind this live personal archive. Features serverless Netlify functions, AniList GraphQL integration, live Discord telemetry, and dynamic GitHub README SVG generation.",
    tech: ["React 19", "TypeScript", "Tailwind v4", "Netlify Functions", "Bun"],
    iconKey: "code",
    accentClass: "bg-black text-white dark:bg-white dark:text-black",
  },
};

export default function Code() {
  const [projects, setProjects] = useState<ProjectDisplay[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cache:client:code');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [loading, setLoading] = useState(projects.length === 0);
  const [totalStars, setTotalStars] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cache:client:code');
        if (cached) {
          const list = JSON.parse(cached) as ProjectDisplay[];
          return list.reduce((acc, curr) => acc + curr.stars, 0);
        }
      } catch {}
    }
    return 17;
  });

  useEffect(() => {
    async function fetchGithubRepos() {
      try {
        setLoading(true);
        const res = await fetch("https://api.github.com/users/MehmetCanWT/repos?per_page=100&sort=updated");
        if (!res.ok) return;

        const data = (await res.json()) as RawGithubRepo[];
        if (!Array.isArray(data)) return;

        // Filter out forks if needed, and map to our display format
        const mapped: ProjectDisplay[] = data
          .filter((repo) => !repo.fork)
          .map((repo) => {
            const known = KNOWN_ENHANCEMENTS[repo.name] || {};
            const techList = known.tech || (repo.language ? [repo.language, ...(repo.topics || [])] : ["Open Source"]);

            return {
              title: repo.name,
              subtitle: known.subtitle || `${(repo.language || 'SOFTWARE').toUpperCase()} // GITHUB REPOSITORY`,
              description: repo.description || known.description || "Open source project engineered by MehmetCanWT.",
              stars: repo.stargazers_count ?? 0,
              githubUrl: repo.html_url,
              demoUrl: repo.homepage || undefined,
              tech: techList,
              iconKey: known.iconKey || "code",
              accentClass: known.accentClass || "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black",
            };
          });

        // SORT STRICTLY BY STARS DESCENDING (Yıldıza göre sıralama)
        const sorted = mapped.sort((a, b) => b.stars - a.stars);
        setProjects(sorted);
        try {
          localStorage.setItem('cache:client:code', JSON.stringify(sorted));
        } catch {}

        const starsCount = sorted.reduce((acc, curr) => acc + curr.stars, 0);
        setTotalStars(starsCount);
      } catch (err) {
        console.error("Failed to fetch live GitHub repositories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGithubRepos();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <SEO 
        title="Code Vault // MehmetCanWT" 
        description="Explore real GitHub open-source repositories and software tools built by MehmetCanWT, ranked by community stars." 
        url="https://mehmetcanwt.xyz/code"
      />
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link to="/" className="manga-panel flex items-center gap-2 font-black uppercase hover:bg-black hover:text-white transition-all py-2 px-4">
          <ArrowLeft size={20} /> Back
        </Link>
        <div className="flex items-center gap-4">
          <div className="manga-panel flex items-center gap-2 font-black uppercase py-2 px-4 text-sm bg-yellow-400 text-black border-2 border-black">
            <Star size={16} className="fill-black" />
            <span>TOTAL STARS: {totalStars}</span>
            {loading && <RefreshCw size={14} className="animate-spin text-black ml-1" />}
          </div>
          <div className="manga-title text-3xl flex items-center gap-2 uppercase italic">
            <Terminal size={28} /> Code Vault
          </div>
        </div>
      </header>

      {/* Grid Layout for Project Cards */}
      {loading && projects.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="manga-panel p-6 border-3 border-black bg-white dark:bg-zinc-900 animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded border-2 border-dashed border-zinc-400 dark:border-zinc-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                </div>
              </div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            const IconComponent = resolveIcon(project.iconKey);

          return (
            <div 
              key={project.title} 
              className="manga-panel flex flex-col justify-between h-full bg-white dark:bg-zinc-900 group relative overflow-hidden border-3 border-black p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Star Badge Pin */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black border-2 border-black font-black text-xs">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span>{project.stars}</span>
              </div>

              {/* Card Body */}
              <div className="space-y-4 pr-16">
                {/* Header Section */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${project.accentClass}`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-widest text-zinc-500 uppercase block">
                      #{index + 1} · {project.subtitle}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-red-500 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tech.map((techItem) => (
                    <span 
                      key={techItem}
                      className="text-xs font-black uppercase px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-2 border-black text-black dark:text-white"
                    >
                      {techItem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t-2 border-black">
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="manga-panel flex items-center gap-2 font-black uppercase text-xs hover:bg-black hover:text-white transition-all py-2 px-4"
                >
                  <Github size={16} /> View Code
                </a>
                {project.demoUrl && (
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="manga-panel flex items-center gap-2 font-black uppercase text-xs bg-red-600 text-white hover:bg-black transition-all py-2 px-4"
                  >
                    <ExternalLink size={16} /> Live Demo
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
