"use client";

import { memo } from 'react';

interface AppleMusicPlayerProps {
  embedUrl?: string;
}

function AppleMusicPlayer({ embedUrl = "https://embed.music.apple.com/us/playlist/todays-hits/pl.f4d106fed2bd41149aaacabb233eb5eb" }: AppleMusicPlayerProps) {
  return (
    <div className="w-full glass-panel rounded-2xl p-4 transition-all duration-300 hover:border-pink-500/40 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]">
      <div className="flex items-center gap-3 mb-3 px-2">
        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
          <span className="text-pink-400 text-sm">🎵</span>
        </div>
        <h3 className="text-white font-medium text-sm font-outfit">Apple Music</h3>
      </div>
      <div className="rounded-xl overflow-hidden bg-black/40 h-[150px] relative">
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          frameBorder="0"
          height="150"
          style={{ width: '100%', maxWidth: '660px', overflow: 'hidden', background: 'transparent' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={embedUrl}
        ></iframe>
      </div>
    </div>
  );
}

export default memo(AppleMusicPlayer);
