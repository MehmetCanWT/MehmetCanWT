import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MehmetCanWT - Anime & Code Enthusiast",
  description: "Anime themed personal website of MehmetCan - Full Stack Developer and Anime Enthusiast",
  keywords: ["mehmetcan", "developer", "anime", "coding", "portfolio"],
  authors: [{ name: "MehmetCan" }],
  creator: "MehmetCan",
  viewport: "width=device-width, initial-scale=1",
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
      <body
        className={`${poppins.className} min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
