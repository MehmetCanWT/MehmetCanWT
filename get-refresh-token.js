const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const SPOTIFY_CLIENT_ID = 'cc9967392b994794ab48ef26ab020feb';
const SPOTIFY_CLIENT_SECRET = 'f47f5e94a18b4d4080a884d5a505be92';
const REDIRECT_URI = 'https://mehmetcanwt.vercel.app/';
const AUTH_CODE = 'AQDOvfCAUt7QSOt4U05rdEaaA_gbnlqQMTOVKCL6YtOP2SpTyeg4F3I7cNNHLcmkSdUhBIioDFT3qrcKflMdRSEyhDoT2f_BVvrypQE5_K1STSZnnT6ygxH_KOQ8whjhNBneDNVgKe5OP5GRkkhJT3SSvG2kE-3H1SQm4cWNdd_jMxzTwPv_LPckwVAMhEmY9syoj0D0je76OMxSoc7M2njN6bbQMIAttugGYVlQ_vtew6vu7sPVszlA';

async function getRefreshToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: AUTH_CODE,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    
    if (data.refresh_token) {
      console.log('✅ SUCCESS! Refresh Token:');
      console.log(data.refresh_token);
      console.log('\n📋 Copy this token to your .env.local file:');
      console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`);
    } else {
      console.log('❌ Error:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getRefreshToken();
