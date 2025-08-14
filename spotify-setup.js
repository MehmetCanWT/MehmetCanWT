// Spotify Web API setup helper
// Bu dosyayı çalıştırarak Spotify refresh token alabilirsiniz

const SPOTIFY_CLIENT_ID = 'cc9967392b994794ab48ef26ab020feb';
const SPOTIFY_CLIENT_SECRET = 'f47f5e94a18b4d4080a884d5a505be92';
const REDIRECT_URI = 'https://mehmetcanwt.vercel.app/';

// Adım 1: Bu URL'yi browser'da açın
const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=user-read-currently-playing user-read-playback-state&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log('1. Bu URL\'yi browser\'da açın:');
console.log(AUTH_URL);
console.log('\n2. Spotify\'a giriş yapın ve izin verin');
console.log('3. Redirect edilen URL\'deki "code" parametresini kopyalayın');
console.log('4. Aşağıdaki fonksiyonu çağırın:');

async function getRefreshToken(authCode) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await response.json();
  console.log('Refresh Token:', data.refresh_token);
  return data.refresh_token;
}

// Kullanım: getRefreshToken('buraya_auth_code_yazın')

module.exports = { getRefreshToken };
