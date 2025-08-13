import { NextRequest, NextResponse } from 'next/server';
import { getAnimeData, initializeDatabase } from '@/lib/anime-db';

export async function GET(request: NextRequest) {
  try {
    // Database'i initialize et
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name') || 'Unknown Anime';

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const animeId = parseInt(id);
    if (isNaN(animeId)) {
      return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
    }

    // Anime verisini al (database'den veya API'den)
    const animeData = await getAnimeData(animeId, name);

    return NextResponse.json({
      success: true,
      data: animeData,
    });

  } catch (error) {
    console.error('Error in anime API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { animes } = body;

    if (!Array.isArray(animes)) {
      return NextResponse.json({ error: 'Animes array is required' }, { status: 400 });
    }

    const results: any[] = [];
    const errors: any[] = [];
    
    for (const anime of animes) {
      if (anime.id && anime.name) {
        try {
          const animeData = await getAnimeData(anime.id, anime.name);
          results.push({
            id: anime.id,
            ...animeData,
          });
        } catch (error) {
          console.error(`Failed to get anime data for ${anime.name}:`, error);
          errors.push({
            id: anime.id,
            name: anime.name,
            error: 'Failed to fetch anime data'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error in anime batch API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
