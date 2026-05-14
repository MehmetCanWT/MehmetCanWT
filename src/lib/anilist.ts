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
  progress: number;
}

const query = `
query ($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME, status: CURRENT) {
    lists {
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
      }
    }
  }
}
`;

export async function getCurrentAnime(userName: string): Promise<AnimeEntry[]> {
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
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const data = await response.json();
    const list = data.data.MediaListCollection.lists[0]?.entries || [];
    
    return list.map((entry: any) => ({
      id: entry.media.id,
      title: entry.media.title,
      coverImage: entry.media.coverImage,
      status: entry.status,
      averageScore: entry.media.averageScore,
      progress: entry.progress,
    }));
  } catch (error) {
    console.error("AniList Fetch Error:", error);
    return [];
  }
}
