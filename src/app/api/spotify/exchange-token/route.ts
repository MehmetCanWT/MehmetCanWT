import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  // Sadece development ortamında çalışsın
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      error: 'This endpoint is only available in development',
    }, { status: 403 });
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({
      success: false,
      error: 'Missing Spotify credentials',
    }, { status: 500 });
  }

  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'Authorization code is required',
      }, { status: 400 });
    }

    const REDIRECT_URI = 'http://127.0.0.1:3000/callback';

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        error: 'Failed to exchange code for token',
        details: errorData,
      }, { status: response.status });
    }

    const tokenData = await response.json();

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      instructions: [
        '1. refresh_token değerini kopyala',
        '2. .env.local dosyasında SPOTIFY_REFRESH_TOKEN=<your_new_token> olarak güncelle',
        '3. Development server\'ı yeniden başlat',
        '4. Recently played özelliği artık çalışacak!'
      ]
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
