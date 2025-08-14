import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import Script from 'next/script'
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
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
        {/* Umami Analytics */}
        <Script
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${poppins.className} min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
