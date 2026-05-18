export interface NewsItem {
  title: string;
  source: string;
}

export async function getMixedNews(): Promise<NewsItem[]> {
  try {
    // 1. Jikan API (MyAnimeList) for Anime News
    const animeRes = await fetch("https://api.jikan.moe/v4/seasons/now", { 
      next: { revalidate: 3600 } 
    });
    const animeData = await animeRes.json();
    const animeNews = (animeData.data || []).slice(0, 5).map((a: any) => ({
      title: `NEW SEASON: ${a.title} HAS STARTED!`,
      source: "Jikan"
    }));

    // 2. Mocking some Gaming News (or use a public API if available without keys)
    const gamingNews = [
      { title: "GTA VI TRAILER 2 RUMORS INTENSIFY FOR LATE 2025", source: "Gaming" },
      { title: "STEAM DECK 2 DEVELOPMENT CONFIRMED BY VALVE SOURCES", source: "Hardware" },
      { title: "ELDER RING DLC REACHES 20 MILLION COPIES SOLD", source: "Gaming" },
      { title: "NINTENDO SWITCH 2 BACKWARD COMPATIBILITY LEAKED", source: "Gaming" },
    ];

    const mixed = [...animeNews, ...gamingNews].sort(() => Math.random() - 0.5);
    
    if (mixed.length === 0) {
      return [{ title: "SYSTEM OPERATIONAL // NO NEW UPDATES IN THE ARCHIVE", source: "System" }];
    }

    return mixed;
  } catch (error) {
    console.error("News Fetch Error:", error);
    return [{ title: "NEWS FEED OFFLINE // VDS NODE 01 STANDBY", source: "System" }];
  }
}
