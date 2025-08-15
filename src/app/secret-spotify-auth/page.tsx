"use client";

import { useState } from 'react';

export default function SpotifyAuthPage() {
  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || 'your_client_id';
  const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
  
  const SCOPES = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-read-recently-played'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `show_dialog=true`;

  const exchangeToken = async () => {
    if (!authCode.trim()) {
      alert('Lütfen authorization code\'u girin!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/spotify/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode.trim() })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setStep(3);
      }
    } catch (error) {
      setResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-green-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎵 Spotify Recently Played Setup</h1>
          <p className="text-green-300">Gizli konfigürasyon sayfası - Sadece MehmetCan için</p>
        </div>

        {step === 1 && (
          <div className="bg-black/50 rounded-2xl p-8 border border-green-500/30">
            <h2 className="text-2xl font-bold mb-6">1️⃣ Spotify Authorization</h2>
            
            <div className="bg-green-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">📋 Gerekli Scope'lar:</h3>
              <ul className="space-y-2">
                <li>✅ user-read-currently-playing</li>
                <li>✅ user-read-playback-state</li>
                <li>🎯 user-read-recently-played (yeni)</li>
              </ul>
            </div>

            <div className="bg-yellow-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">⚠️ Önemli Notlar:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Redirect URI: http://127.0.0.1:3000/callback</li>
                <li>• Bu URI Spotify Dashboard'da ayarlanmış olmalı</li>
                <li>• Authorization sonrası URL'den code'u kopyalayacaksınız</li>
              </ul>
            </div>

            <div className="text-center">
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors duration-200 transform hover:scale-105"
              >
                🔑 Spotify'da Yetki Ver
              </a>
              
              <button
                onClick={() => setStep(2)}
                className="block mx-auto mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Authorization tamamlandı →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-black/50 rounded-2xl p-8 border border-green-500/30">
            <h2 className="text-2xl font-bold mb-6">2️⃣ Authorization Code</h2>
            
            <div className="bg-blue-900/30 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">📝 Code'u Yapıştırın:</h3>
              <p className="text-sm text-gray-300 mb-4">
                Callback sayfasından aldığınız authorization code'u aşağıya yapıştırın:
              </p>
              
              <textarea
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="AQA... ile başlayan kod buraya"
                className="w-full h-32 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none resize-none font-mono text-sm"
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setStep(1)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors duration-200"
              >
                ← Geri
              </button>
              
              <button
                onClick={exchangeToken}
                disabled={loading || !authCode.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg transition-colors duration-200 font-semibold"
              >
                {loading ? '🔄 Token alınıyor...' : '🔄 Token Al'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="bg-black/50 rounded-2xl p-8 border border-green-500/30">
            <h2 className="text-2xl font-bold mb-6">3️⃣ Sonuç</h2>
            
            {result.success ? (
              <div className="bg-green-900/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-green-300 mb-4">✅ Başarılı!</h3>
                
                <div className="bg-black/50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">🔑 Yeni Refresh Token:</h4>
                  <code className="block bg-gray-800 p-3 rounded text-sm break-all">
                    {result.refresh_token}
                  </code>
                </div>

                <div className="bg-black/50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-2">🎯 Scope'lar:</h4>
                  <code className="text-green-300">{result.scope}</code>
                </div>

                <div className="bg-yellow-900/30 p-4 rounded-lg">
                  <h4 className="font-bold mb-2">📋 Sonraki Adımlar:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>.env.local dosyasını açın</li>
                    <li>SPOTIFY_REFRESH_TOKEN değerini yukarıdaki token ile değiştirin</li>
                    <li>Development server'ı yeniden başlatın</li>
                    <li>Recently played özelliği artık çalışacak! 🎵</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-red-900/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-300 mb-4">❌ Hata</h3>
                <p className="text-red-200 mb-4">{result.error}</p>
                <button
                  onClick={() => setStep(2)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  ← Tekrar Dene
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>🔒 Bu sayfa sadece development ortamında erişilebilir</p>
          <p>Production'da bu sayfa mevcut olmayacak</p>
        </div>
      </div>
    </div>
  );
}
