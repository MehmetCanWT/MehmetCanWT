import { ImageResponse } from 'next/og';
import { getAllAnime, getAnimeById } from '@/lib/anilist';
import { getAllGames } from '@/lib/steam';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [animes, allGames] = await Promise.all([
    getAllAnime('MehmetCanWT'),
    getAllGames('76561198200466026')
  ]);

  const favoriteAnime = await getAnimeById(21) || animes[0];
  const topGame = [...allGames].sort((a, b) => b.playtime_forever - a.playtime_forever)[0];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex',
            backgroundColor: '#000', 
            color: '#fff', 
            padding: '10px 20px', 
            fontSize: '32px', 
            fontWeight: 900,
            fontStyle: 'italic',
            textTransform: 'uppercase' 
          }}>
            MEHMETCANWT // SYSTEM PREVIEW
          </div>
        </div>

        <div style={{
          display: 'flex',
          width: '100%',
          backgroundColor: '#fff',
          border: '4px solid #000',
          boxShadow: '8px 8px 0px #000',
          padding: '20px',
          marginBottom: '30px'
        }}>
           <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', backgroundColor: '#000', color: '#fff', padding: '4px 10px', fontSize: '14px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '10px' }}>
                FAVORITE ANIME
              </div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }}>
                {favoriteAnime?.title.english || favoriteAnime?.title.romaji || 'ONE PIECE'}
              </div>
              <div style={{ display: 'flex', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', color: '#666' }}>
                STATUS: {favoriteAnime?.status || 'COMPLETED'} // SCORE: {favoriteAnime?.averageScore}%
              </div>
           </div>
        </div>

        <div style={{
          display: 'flex',
          width: '100%',
          backgroundColor: '#fff',
          border: '4px solid #000',
          boxShadow: '8px 8px 0px #000',
          padding: '20px'
        }}>
           <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', backgroundColor: '#000', color: '#fff', padding: '4px 10px', fontSize: '14px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '10px' }}>
                MOST PLAYED MISSION
              </div>
              <div style={{ display: 'flex', fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic' }}>
                {topGame?.name || 'COUNTER-STRIKE 2'}
              </div>
              <div style={{ display: 'flex', fontSize: '14px', fontWeight: 'bold', marginTop: '10px', color: '#666' }}>
                TOTAL PLAYTIME: {(topGame?.playtime_forever / 60 || 0).toFixed(0)} HOURS // ACTIVE
              </div>
           </div>
        </div>

        <div style={{ display: 'flex', marginTop: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.5 }}>
          LIVE UPDATE FROM MEHMETCANWT.XYZ // VDS NODE 01
        </div>
      </div>
    ),
    {
      width: 800,
      height: 500,
    }
  );
}
