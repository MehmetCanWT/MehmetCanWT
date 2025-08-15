import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

export async function GET() {
  if (!CLIENT_ID) {
    return NextResponse.json({
      success: false,
      error: 'Missing Spotify Client ID',
    }, { status: 500 });
  }

  const REDIRECT_URI = 'http://localhost:3000/callback'; // Spotify Developer Dashboard'da bu URI olmalı
  const SCOPES = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-read-recently-played'  // Bu scope eksik olan
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `show_dialog=true`; // Her zaman izin ekranını göster

  return NextResponse.json({
    success: true,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    required_scopes: SCOPES.split(' '),
    authorization_url: authUrl,
    spotify_dashboard_info: {
      message: "Eğer INVALID_CLIENT hatası alıyorsanız:",
      steps: [
        "1. https://developer.spotify.com/dashboard adresine gidin",
        "2. App'inizi seçin",
        "3. 'Edit Settings' butonuna tıklayın", 
        "4. 'Redirect URIs' kısmına şu URI'yi ekleyin: http://localhost:3000/callback",
        "5. 'Save' butonuna tıklayın",
        "6. Tekrar deneyin"
      ]
    },
    instructions: [
      '1. Authorization URL\'e git',
      '2. Spotify\'da login ol ve izinleri onayla',
      '3. Redirect edildiğinde URL\'den code parametresini kopyala',
      '4. O code ile yeni refresh token al'
    ]
  });
}
