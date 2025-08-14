import { NextRequest, NextResponse } from 'next/server';
import {
  initializeDatabase,
  fetchUserAnimeListFromAniList,
  saveUserAnimeListToDB,
  updateLastUpdateTime,
} from '@/lib/anime-db';

const USERNAME = 'mehmetcanwt';

// Cron job için anime listesi güncelleme endpoint'i
export async function POST(request: NextRequest) {
  try {
    // Güvenlik için basit bir token kontrolü (isteğe bağlı)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET; // .env'de tanımlanabilir
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await initializeDatabase();
    
    console.log('Cron job: Updating anime list from AniList...');
    
    // AniList'ten kullanıcı anime listesini çek
    const animeList = await fetchUserAnimeListFromAniList(USERNAME);
    
    if (animeList.length > 0) {
      // Database'e kaydet
      await saveUserAnimeListToDB(animeList);
      
      // Güncelleme zamanını kaydet
      await updateLastUpdateTime(USERNAME);
      
      console.log(`Cron job: Successfully updated ${animeList.length} anime entries`);
      
      return NextResponse.json({
        success: true,
        message: `Successfully updated ${animeList.length} anime entries`,
        count: animeList.length,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('Cron job: No anime data found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'No anime data found for user',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update anime list',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET request için bilgi endpoint'i
export async function GET() {
  return NextResponse.json({
    message: 'Anime List Cron Job Endpoint',
    usage: 'Send POST request to update anime list',
    note: 'This endpoint is designed to be called by cron jobs',
  });
}
