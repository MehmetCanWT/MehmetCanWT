import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

export async function GET() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'Missing Spotify credentials',
    }, { status: 500 });
  }

  try {
    // Token bilgilerini al
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
      return NextResponse.json({
        success: false,
        error: 'Failed to refresh token',
      }, { status: response.status });
    }

    const tokenData = await response.json();
    
    // Token'ın scope'larını kontrol et
    const scopes = tokenData.scope ? tokenData.scope.split(' ') : [];
    
    const requiredScopes = [
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-read-playback-state'
    ];

    const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));

    return NextResponse.json({
      success: true,
      scopes,
      requiredScopes,
      missingScopes,
      hasAllScopes: missingScopes.length === 0,
      authUrl: missingScopes.length > 0 ? 
        `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000&scope=${requiredScopes.join('%20')}&show_dialog=true` 
        : null
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
