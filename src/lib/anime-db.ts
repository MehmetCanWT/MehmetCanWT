import { createClient } from '@libsql/client';

// Turso database client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export interface UserAnimeData {
  id: number;
  title_english: string;
  title_romaji: string;
  image_url: string;
  status: string;
  score: number;
  progress: number;
  updated_at?: string;
}

// Database'de anime tablosunu oluştur
export async function initializeDatabase() {
  try {
    // Kullanıcı anime listesi tablosu
    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_anime_list (
        id INTEGER PRIMARY KEY,
        title_english TEXT,
        title_romaji TEXT NOT NULL,
        image_url TEXT NOT NULL,
        status TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        progress INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(id)
      )
    `);

    // Liste güncelleme zamanını takip eden tablo
    await client.execute(`
      CREATE TABLE IF NOT EXISTS list_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(username)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// AniList kullanıcı listesini çek
export async function fetchUserAnimeListFromAniList(username: string) {
  try {
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
                  extraLarge
                  large
                }
                averageScore
              }
              status
              score
              progress
            }
          }
        }
      }
    `;

    const variables = { userName: username };

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
    
    if (data.data && data.data.MediaListCollection) {
      const allEntries: any[] = [];
      
      // Tüm listelerdeki anime'leri birleştir
      data.data.MediaListCollection.lists.forEach((list: any) => {
        allEntries.push(...list.entries);
      });

      return allEntries.map((entry: any) => ({
        id: entry.media.id,
        title_english: entry.media.title.english,
        title_romaji: entry.media.title.romaji,
        image_url: entry.media.coverImage.extraLarge || entry.media.coverImage.large,
        status: entry.status,
        score: entry.score || entry.media.averageScore || 0, // Kullanıcı skoru yoksa AniList ortalama skoru
        progress: entry.progress || 0,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user anime list from AniList:', error);
    return [];
  }
}

// Kullanıcı anime listesini database'e kaydet
export async function saveUserAnimeListToDB(animeList: UserAnimeData[]) {
  try {
    // Önce tabloyu temizle
    await client.execute('DELETE FROM user_anime_list');
    
    // Yeni verileri ekle
    for (const anime of animeList) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO user_anime_list 
              (id, title_english, title_romaji, image_url, status, score, progress, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        args: [
          anime.id,
          anime.title_english || null,
          anime.title_romaji,
          anime.image_url,
          anime.status,
          anime.score,
          anime.progress,
        ]
      });
    }
    
    console.log(`Saved ${animeList.length} anime entries to database`);
  } catch (error) {
    console.error('Error saving user anime list to DB:', error);
  }
}

// Database'den kullanıcı anime listesini çek
export async function getUserAnimeListFromDB(): Promise<UserAnimeData[]> {
  try {
    const result = await client.execute('SELECT * FROM user_anime_list ORDER BY score DESC, title_romaji ASC');
    
    return result.rows.map(row => ({
      id: row.id as number,
      title_english: row.title_english as string,
      title_romaji: row.title_romaji as string,
      image_url: row.image_url as string,
      status: row.status as string,
      score: row.score as number,
      progress: row.progress as number,
      updated_at: row.updated_at as string,
    }));
  } catch (error) {
    console.error('Error getting user anime list from DB:', error);
    return [];
  }
}

// Son güncelleme zamanını kontrol et
export async function getLastUpdateTime(username: string): Promise<Date | null> {
  try {
    const result = await client.execute({
      sql: 'SELECT last_updated FROM list_updates WHERE username = ?',
      args: [username]
    });
    
    if (result.rows.length > 0) {
      return new Date(result.rows[0].last_updated as string);
    }
    return null;
  } catch (error) {
    console.error('Error getting last update time:', error);
    return null;
  }
}

// Güncelleme zamanını kaydet
export async function updateLastUpdateTime(username: string) {
  try {
    await client.execute({
      sql: 'INSERT OR REPLACE INTO list_updates (username, last_updated) VALUES (?, CURRENT_TIMESTAMP)',
      args: [username]
    });
  } catch (error) {
    console.error('Error updating last update time:', error);
  }
}

// Liste güncelleme gerekli mi kontrol et (1 saat = 3600000 ms)
export async function shouldUpdateList(username: string): Promise<boolean> {
  const lastUpdate = await getLastUpdateTime(username);
  if (!lastUpdate) {
    return true; // Hiç güncellenmemişse güncelle
  }
  
  const oneHourAgo = new Date(Date.now() - 3600000);
  return lastUpdate < oneHourAgo;
}
