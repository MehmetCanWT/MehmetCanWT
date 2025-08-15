import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    
    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'No refresh token found' });
    }

    // Get access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ success: false, error: 'Failed to refresh token' });
    }

    const tokenData = await tokenResponse.json();
    
    // Get recently played tracks
    const recentlyPlayedResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!recentlyPlayedResponse.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch recently played tracks' });
    }

    const recentlyPlayedData = await recentlyPlayedResponse.json();
    
    const tracks = recentlyPlayedData.items.map((item: any) => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      image: item.track.album.images[0]?.url || '',
      external_url: item.track.external_urls.spotify,
      played_at: item.played_at,
      preview_url: item.track.preview_url,
    }));

    // Sort by played_at to ensure most recent first
    tracks.sort((a: any, b: any) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime());

    return NextResponse.json({ 
      success: true, 
      tracks 
    });

  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
