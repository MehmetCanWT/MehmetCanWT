import { NextResponse } from 'next/server';

// Spotify Web API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

// Access token cache
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string | null> {
  // Eğer token hala geçerliyse kullan
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('Missing Spotify credentials');
    return null;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh Spotify token:', response.statusText);
      return null;
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 dakika erken expire et

    return accessToken;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
}

export async function GET() {
  try {
    const token = await getAccessToken();
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Unable to get Spotify access token',
      }, { status: 401 });
    }

    // Currently playing track'i çek
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 204 || response.status === 404) {
      // Hiçbir şey çalmıyor
      return NextResponse.json({
        success: true,
        track: null,
        message: 'No track currently playing',
      });
    }

    if (!response.ok) {
      console.error('Spotify API error:', response.statusText);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current track',
      }, { status: response.status });
    }

    const data = await response.json();

    if (!data.item) {
      return NextResponse.json({
        success: true,
        track: null,
        message: 'No track data available',
      });
    }

    const track = {
      name: data.item.name,
      artist: data.item.artists.map((artist: any) => artist.name).join(', '),
      album: data.item.album.name,
      image: data.item.album.images[0]?.url || '',
      preview_url: data.item.preview_url,
      external_url: data.item.external_urls.spotify,
      is_playing: data.is_playing,
      progress_ms: data.progress_ms,
      duration_ms: data.item.duration_ms,
    };

    return NextResponse.json({
      success: true,
      track,
    });

  } catch (error) {
    console.error('Error in Spotify API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
