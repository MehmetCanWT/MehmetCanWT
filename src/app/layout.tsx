import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MehmetCanWT",
  description: "Anime themed personal website",
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
