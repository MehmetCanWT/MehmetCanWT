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

  const gameImageUrl = topGame ? 'https://cdn.akamai.steamstatic.com/steam/apps/' + topGame.appid + '/header.jpg' : '';

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
          padding: '30px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', width: '100%', marginBottom: '15px' }}>
          <div style={{ 
            display: 'flex',
            backgroundColor: '#000', 
            color: '#fff', 
            padding: '8px 16px', 
            fontSize: '28px', 
            fontWeight: 900,
            fontStyle: 'italic',
            textTransform: 'uppercase' 
          }}>
            MEHMETCANWT // LIVE ARCHIVE
          </div>
        </div>

        {/* Anime Box */}
        <div style={{
          display: 'flex',
          width: '100%',
          backgroundColor: '#fff',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
          padding: '15px',
          marginBottom: '20px',
          alignItems: 'center'
        }}>
           <div style={{ display: 'flex', width: '80px', height: '110px', border: '2px solid #000', marginRight: '20px', overflow: 'hidden' }}>
              <img 
                src={favoriteAnime?.coverImage.large} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', backgroundColor: '#000', color: '#fff', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '5px' }}>
                FAVORITE ANIME
              </div>
              <div style={{ display: 'flex', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.1 }}>
                {favoriteAnime?.title.english || favoriteAnime?.title.romaji || 'ONE PIECE'}
              </div>
              <div style={{ display: 'flex', fontSize: '12px', fontWeight: 'bold', marginTop: '5px', color: '#666' }}>
                STATUS: {favoriteAnime?.status || 'COMPLETED'} // {favoriteAnime?.averageScore}% SCORE
              </div>
           </div>
        </div>

        {/* Game Box */}
        <div style={{
          display: 'flex',
          width: '100%',
          backgroundColor: '#fff',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
          padding: '15px',
          alignItems: 'center'
        }}>
           <div style={{ display: 'flex', width: '140px', height: '80px', border: '2px solid #000', marginRight: '20px', overflow: 'hidden' }}>
              <img 
                src={gameImageUrl} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', backgroundColor: '#000', color: '#fff', padding: '2px 8px', fontSize: '12px', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '5px' }}>
                MOST PLAYED MISSION
              </div>
              <div style={{ display: 'flex', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.1 }}>
                {topGame?.name || 'COUNTER-STRIKE 2'}
              </div>
              <div style={{ display: 'flex', fontSize: '12px', fontWeight: 'bold', marginTop: '5px', color: '#666' }}>
                TOTAL OPERATION TIME: {(topGame?.playtime_forever / 60 || 0).toFixed(0)} HOURS
              </div>
           </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', marginTop: '15px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.5 }}>
          SYNCED WITH VDS NODE 01 // MEHMETCANWT.XYZ
        </div>
      </div>
    ),
    {
      width: 800,
      height: 500,
    }
  );
}
