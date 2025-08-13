import { createClient } from '@libsql/client';

// Turso database client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export interface AnimeData {
  id: number;
  name: string;
  image_url: string;
  created_at: string;
}

// Database'de anime tablosunu oluştur
export async function initializeDatabase() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS anime_cache (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Anime'yi database'den çek
export async function getAnimeFromDB(id: number): Promise<AnimeData | null> {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM anime_cache WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        id: row.id as number,
        name: row.name as string,
        image_url: row.image_url as string,
        created_at: row.created_at as string,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting anime from DB:', error);
    return null;
  }
}

// Anime'yi database'e kaydet
export async function saveAnimeToDB(id: number, name: string, imageUrl: string): Promise<void> {
  try {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO anime_cache (id, name, image_url) VALUES (?, ?, ?)',
      args: [id, name, imageUrl]
    });
    console.log(`Anime saved to DB: ${name}`);
  } catch (error) {
    console.error('Error saving anime to DB:', error);
  }
}

// AniList API'den anime verisini çek
export async function fetchAnimeFromAniList(id: number): Promise<{ name: string; imageUrl: string } | null> {
  try {
    const query = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            color
          }
          bannerImage
        }
      }
    `;

    const variables = { id };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.Media) {
      const media = data.data.Media;
      const name = media.title.english || media.title.romaji || media.title.native;
      
      // En kaliteli resmi al: extraLarge > large
      const imageUrl = media.coverImage.extraLarge || media.coverImage.large;
      
      console.log(`Fetched high quality image for ${name}: ${imageUrl}`);
      return { name, imageUrl };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    return null;
  }
}

// Ana fonksiyon: Database'den çek, yoksa API'den çek ve kaydet
export async function getAnimeData(id: number, fallbackName: string): Promise<{ name: string; imageUrl: string }> {
  // Önce database'den kontrol et
  const dbData = await getAnimeFromDB(id);
  if (dbData) {
    console.log(`Anime found in DB: ${dbData.name}`);
    return {
      name: dbData.name,
      imageUrl: dbData.image_url,
    };
  }

  // Database'de yoksa AniList'ten çek
  console.log(`Fetching anime from AniList: ${fallbackName}`);
  const apiData = await fetchAnimeFromAniList(id);
  
  if (apiData) {
    // Database'e kaydet
    await saveAnimeToDB(id, apiData.name, apiData.imageUrl);
    return apiData;
  }

  // AniList'ten de çekemediyse hata ver
  throw new Error(`Could not fetch anime data for ID: ${id}`);
}
