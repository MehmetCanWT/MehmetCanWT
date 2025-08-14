import { NextRequest, NextResponse } from 'next/server';
import {
  initializeDatabase,
  fetchUserAnimeListFromAniList,
  saveUserAnimeListToDB,
  getUserAnimeListFromDB,
  shouldUpdateList,
  updateLastUpdateTime,
} from '@/lib/anime-db';

const USERNAME = 'mehmetcanwt';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    // URL'den cache_only parametresini kontrol et
    const { searchParams } = new URL(request.url);
    const cacheOnly = searchParams.get('cache_only') === 'true';
    
    if (cacheOnly) {
      // Sadece database'den çek, güncelleme yapma
      console.log('Fetching anime list from database cache only...');
      const animeList = await getUserAnimeListFromDB();
      
      return NextResponse.json({
        success: true,
        data: animeList,
        count: animeList.length,
        cached: true,
        message: 'Data fetched from cache only'
      });
    }
    
    // Normal davranış - 1 saat geçtiyse güncelle
    const needsUpdate = await shouldUpdateList(USERNAME);
    
    if (needsUpdate) {
      console.log('Updating anime list from AniList...');
      
      // AniList'ten kullanıcı anime listesini çek
      const animeList = await fetchUserAnimeListFromAniList(USERNAME);
      
      if (animeList.length > 0) {
        // Database'e kaydet
        await saveUserAnimeListToDB(animeList);
        
        // Güncelleme zamanını kaydet
        await updateLastUpdateTime(USERNAME);
        
        console.log(`Updated ${animeList.length} anime entries`);
      }
    } else {
      console.log('Using cached anime list (updated within last hour)');
    }
    
    // Database'den anime listesini çek
    const animeList = await getUserAnimeListFromDB();
    
    return NextResponse.json({
      success: true,
      data: animeList,
      count: animeList.length,
      cached: !needsUpdate,
    });
    
  } catch (error) {
    console.error('Error in user-anime API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user anime list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Manuel güncelleme için POST endpoint
export async function POST() {
  try {
    await initializeDatabase();
    
    console.log('Force updating anime list from AniList...');
    
    // AniList'ten kullanıcı anime listesini çek
    const animeList = await fetchUserAnimeListFromAniList(USERNAME);
    
    if (animeList.length > 0) {
      // Database'e kaydet
      await saveUserAnimeListToDB(animeList);
      
      // Güncelleme zamanını kaydet
      await updateLastUpdateTime(USERNAME);
      
      console.log(`Force updated ${animeList.length} anime entries`);
      
      return NextResponse.json({
        success: true,
        data: animeList,
        count: animeList.length,
        message: 'Anime list force updated successfully',
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No anime data found for user',
        },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error in force update user-anime API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to force update user anime list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
