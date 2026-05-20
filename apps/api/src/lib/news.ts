import { withCache } from './cache';

export interface NewsItem {
  title: string;
  source: string;
}

interface JikanAnime {
  title: string;
}

export async function getMixedNews(): Promise<NewsItem[]> {
  return withCache('mixed-news', 1800, async () => {
    try {
      const animeRes = await fetch("https://api.jikan.moe/v4/seasons/now");
      
      if (!animeRes.ok) {
        console.error(`Jikan API error: ${animeRes.status}`);
        return [{ title: "NEWS FEED OFFLINE // VDS NODE 01 STANDBY", source: "System" }];
      }

      const animeData = await animeRes.json();
      const animeNews = (animeData.data || []).slice(0, 5).map((a: JikanAnime) => ({
        title: `NEW SEASON: ${a.title} HAS STARTED!`,
        source: "Jikan"
      }));

      // Static gaming headlines as placeholders — replace with a real API when available
      const gamingNews: NewsItem[] = [
        { title: "GTA VI OFFICIAL RELEASE DATE ANNOUNCED", source: "Gaming" },
        { title: "STEAM SUMMER SALE 2026 IS LIVE NOW", source: "Gaming" },
        { title: "ELDEN RING NIGHTREIGN LAUNCHES TO CRITICAL ACCLAIM", source: "Gaming" },
        { title: "NINTENDO SWITCH 2 NOW AVAILABLE WORLDWIDE", source: "Gaming" },
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
  });
}
