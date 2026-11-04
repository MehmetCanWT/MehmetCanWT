import { withCache } from './cache';

export interface AnimeEntry {
  id: number;
  title: {
    english: string;
    romaji: string;
  };
  coverImage: {
    large: string;
  };
  status: string;
  averageScore: number;
  userScore: number;
  progress: number;
  isPinned?: boolean;
  description?: string;
}

interface AniListMediaEntry {
  media: {
    id: number;
    title: { english: string; romaji: string };
    coverImage: { large: string };
    averageScore: number;
    description?: string;
  };
  status: string;
  progress: number;
  score: number;
}

interface AniListList {
  name: string;
  entries: AniListMediaEntry[];
}

const query = `
query ($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      name
      entries {
        media {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          description(asHtml: false)
        }
        status
        progress
        score(format: POINT_5)
      }
    }
  }
}
`;

export async function getAllAnime(userName: string): Promise<AnimeEntry[]> {
  return withCache(`anilist-all-${userName}`, 3600, async () => {
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables: { userName },
        }),
      });

      if (!response.ok) {
        console.error(`AniList API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error("AniList GraphQL errors:", data.errors);
        return [];
      }

      const lists: AniListList[] = data.data?.MediaListCollection?.lists || [];
      
      const allEntries: AnimeEntry[] = [];
      
      lists.forEach((list) => {
        list.entries.forEach((entry) => {
          allEntries.push({
            id: entry.media.id,
            title: entry.media.title,
            coverImage: entry.media.coverImage,
            status: entry.status,
            averageScore: entry.media.averageScore,
            userScore: entry.score || 0,
            progress: entry.progress,
            description: entry.media.description,
          });
        });
      });

      const statusOrder: Record<string, number> = {
        "COMPLETED": 0,
        "CURRENT": 1,
        "REPEATING": 1,
        "DROPPED": 2,
        "PLANNING": 3,
        "PAUSED": 4
      };

      return allEntries.sort((a, b) => {
        // 1. User Star Rating (Score) descending: 5 stars -> 4 stars -> unrated (0)
        const scoreA = a.userScore || 0;
        const scoreB = b.userScore || 0;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }

        // 2. Status order: COMPLETED -> CURRENT -> DROPPED -> PLANNING
        const orderA = statusOrder[a.status] ?? 99;
        const orderB = statusOrder[b.status] ?? 99;
        if (orderA !== orderB) return orderA - orderB;

        // 3. Community Average Score
        return (b.averageScore || 0) - (a.averageScore || 0);
      });

    } catch (error) {
      console.error("AniList Fetch Error:", error);
      return [];
    }
  });
}

export async function getAnimeById(id: number): Promise<AnimeEntry | null> {
  return withCache(`anilist-id-${id}`, 3600, async () => {
    const singleQuery = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          description(asHtml: false)
        }
      }
    `;
    
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: singleQuery, variables: { id } }),
      });

      if (!response.ok) {
        console.error(`AniList API error for id ${id}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (data.errors || !data.data?.Media) {
        console.error("AniList GraphQL error for id:", id, data.errors);
        return null;
      }

      const media = data.data.Media;
      return {
        id: media.id,
        title: media.title,
        coverImage: media.coverImage,
        status: "COMPLETED",
        averageScore: media.averageScore,
        userScore: 0,
        progress: 0,
        description: media.description
      };
    } catch (error) {
      console.error(`Failed to fetch anime by id ${id}:`, error);
      return null;
    }
  });
}
