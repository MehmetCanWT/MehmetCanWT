"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const authCode = searchParams.get('code');
    const authError = searchParams.get('error');
    
    if (authCode) {
      setCode(authCode);
    }
    
    if (authError) {
      setError(authError);
    }
  }, [searchParams]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    alert('Code kopyalandı!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-green-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-black/50 rounded-2xl p-8 border border-green-500/30">
        <h1 className="text-3xl font-bold text-center mb-6">🎵 Spotify Callback</h1>
        
        {error ? (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-300 mb-4">❌ Authorization Başarısız</h2>
            <p className="text-red-200 mb-4">Hata: {error}</p>
            <a 
              href="/secret-spotify-auth"
              className="inline-block bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-colors duration-200"
            >
              ← Tekrar Dene
            </a>
          </div>
        ) : code ? (
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold text-green-300 mb-4 text-center">✅ Authorization Başarılı!</h2>
            
            <div className="bg-black/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">🔑 Authorization Code:</h3>
              <div className="bg-gray-800 p-3 rounded border border-gray-600">
                <code className="text-sm break-all text-green-300 block">
                  {code}
                </code>
              </div>
              <button
                onClick={copyToClipboard}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors duration-200"
              >
                📋 Kopyala
              </button>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">📋 Sonraki Adımlar:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Yukarıdaki code'u kopyalayın</li>
                <li>Auth sayfasına geri dönün</li>
                <li>Code'u yapıştırıp "Token Al" butonuna tıklayın</li>
              </ol>
            </div>

            <div className="text-center">
              <a
                href="/secret-spotify-auth"
                className="inline-block bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-semibold"
              >
                🔙 Auth Sayfasına Dön
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/30 border border-gray-500/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">⏳ Bekleniyor...</h2>
            <p className="text-gray-300">Authorization kod veya hata mesajı bekleniyor...</p>
          </div>
        )}

        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>🔒 Bu sayfa sadece development ortamında çalışır</p>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-black to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
