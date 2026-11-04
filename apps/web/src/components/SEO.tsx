import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title = "MehmetCanWT // Live Archive", 
  description = "Personal Terminal & Archive of MehmetCanWT. Tracking Anime, Games, and Code.",
  image,
  url,
}: SEOProps) {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const finalUrl = url || currentOrigin;
  const finalImage = image || `${currentOrigin}/api/og/readme`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}
