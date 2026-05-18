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
        }
        status
        progress
        score(format: POINT_100)
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

      const data = await response.json();
      const lists = data.data.MediaListCollection.lists || [];
      
      const allEntries: AnimeEntry[] = [];
      
      lists.forEach((list: any) => {
        list.entries.forEach((entry: any) => {
          allEntries.push({
            id: entry.media.id,
            title: entry.media.title,
            coverImage: entry.media.coverImage,
            status: entry.status,
            averageScore: entry.media.averageScore,
            userScore: entry.score || 0,
            progress: entry.progress,
          });
        });
      });

      const statusOrder: Record<string, number> = {
        "CURRENT": 0,
        "REPEATING": 0,
        "COMPLETED": 1,
        "PAUSED": 2,
        "DROPPED": 3,
        "PLANNING": 4
      };

      return allEntries.sort((a, b) => {
        const orderA = statusOrder[a.status] ?? 99;
        const orderB = statusOrder[b.status] ?? 99;
        
        if (orderA !== orderB) return orderA - orderB;
        return b.userScore - a.userScore;
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
        }
      }
    `;
    
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: singleQuery, variables: { id } }),
      });
      const data = await response.json();
      const media = data.data.Media;
      return {
        id: media.id,
        title: media.title,
        coverImage: media.coverImage,
        status: "COMPLETED",
        averageScore: media.averageScore,
        userScore: 0,
        progress: 0
      };
    } catch (error) {
      return null;
    }
  });
}
