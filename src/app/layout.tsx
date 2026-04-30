import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Outfit, Noto_Sans_JP } from "next/font/google";
import Script from 'next/script'
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-jp",
  display: 'swap',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "MehmetCanWT - Anime & Code Enthusiast",
  description: "Anime themed personal website of MehmetCan - Full Stack Developer and Anime Enthusiast",
  keywords: ["mehmetcan", "developer", "anime", "coding", "portfolio"],
  authors: [{ name: "MehmetCan" }],
  creator: "MehmetCan",
  robots: "index, follow",
  openGraph: {
    title: "MehmetCanWT - Anime & Code Enthusiast",
    description: "Anime themed personal website of MehmetCan - Full Stack Developer and Anime Enthusiast",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "MehmetCanWT - Anime & Code Enthusiast",
    description: "Anime themed personal website of MehmetCan - Full Stack Developer and Anime Enthusiast",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://api.spotify.com" />
        <link rel="preconnect" href="https://i.scdn.co" />
        <link rel="preconnect" href="https://s4.anilist.co" />
        <link rel="preconnect" href="https://cdn.anilist.co" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        
        {/* Umami Analytics */}
        {process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${outfit.variable} ${notoSansJP.variable} font-outfit min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
