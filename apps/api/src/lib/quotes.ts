import { db, dailyQuote } from 'db';
import { eq } from 'drizzle-orm';

export interface QuoteData {
  quote: string;
  character: string;
  anime: string;
  characterImage?: string;
  animeImage?: string;
  isFallback?: boolean;
}

const QUOTE_SINGLETON_ID = 'global';

const FALLBACK_QUOTES: QuoteData[] = [
  { quote: "Believe in the me that believes in you!", character: "Kamina", anime: "Gurren Lagann", characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/b2075-sWb5Xz76JWdX.png", animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx2001-XwRnjzGeFWRQ.png" },
  { quote: "I am the hope of the universe. I am the answer to all living things that cry out for peace.", character: "Goku", anime: "Dragon Ball Z", characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/246-wsRRr6z1kii8.png", animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png" },
  { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece", characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png", animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg" }
];

async function fetchWithCheck(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`API error ${res.status} for ${url}`);
      return null;
    }
    return res;
  } catch (e) {
    console.error(`Fetch error for ${url}:`, e);
    return null;
  }
}

async function fetchCharacterAndAnimeImages(character: string, animeName: string): Promise<{ characterImage: string; animeImage: string }> {
  const charQuery = `query ($search: String) { Character(search: $search) { image { large } } }`;
  const animeQuery = `query ($search: String) { Media(search: $search, type: ANIME) { coverImage { large } } }`;

  const [charRes, animeRes] = await Promise.all([
    fetchWithCheck("https://graphql.anilist.co", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: charQuery, variables: { search: character } })
    }),
    fetchWithCheck("https://graphql.anilist.co", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: animeQuery, variables: { search: animeName } })
    })
  ]);

  let characterImage = "";
  let animeImage = "";

  if (charRes) {
    const data = await charRes.json();
    characterImage = data?.data?.Character?.image?.large || "";
  }

  if (animeRes) {
    const data = await animeRes.json();
    animeImage = data?.data?.Media?.coverImage?.large || "";
  }

  return { characterImage, animeImage };
}

export async function getDailyQuote(forceUpdate: boolean = false): Promise<QuoteData> {
  try {
    if (!forceUpdate) {
      // 1. Check database for existing quote
      if (db) {
        try {
          const dbQuotes = await db.select().from(dailyQuote).where(eq(dailyQuote.id, QUOTE_SINGLETON_ID));
          const dbQuoteItem = dbQuotes[0];

          if (dbQuoteItem) {
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - dbQuoteItem.updatedAt.getTime());
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

            if (diffHours < 24) {
              return {
                quote: dbQuoteItem.quote,
                character: dbQuoteItem.character,
                anime: dbQuoteItem.anime,
                characterImage: dbQuoteItem.characterImage || undefined,
                animeImage: dbQuoteItem.animeImage || undefined,
                isFallback: false
              };
            }
          }
        } catch (e) {
          console.error("DB query error in getDailyQuote:", e);
        }
      }
    }

    // 2. Fetch new quote from Yurippe API
    let newQuote = { quote: "", character: "", anime: "" };
    let isFallback = false;

    const quoteRes = await fetchWithCheck("https://yurippe.vercel.app/api/quotes?random=1");
    
    if (quoteRes) {
      const quoteData = await quoteRes.json();
      if (Array.isArray(quoteData) && quoteData.length > 0 && quoteData[0].quote) {
        newQuote = {
          quote: quoteData[0].quote,
          character: quoteData[0].character,
          anime: quoteData[0].show
        };
      } else {
        isFallback = true;
      }
    } else {
      isFallback = true;
    }

    if (isFallback) {
      const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      newQuote = { quote: fallback.quote, character: fallback.character, anime: fallback.anime };
    }

    // 3. Fetch images (parallel)
    let characterImage = "";
    let animeImage = "";

    if (!isFallback) {
      const images = await fetchCharacterAndAnimeImages(newQuote.character, newQuote.anime);
      characterImage = images.characterImage;
      animeImage = images.animeImage;
    }

    // Fallback images
    if (isFallback || !characterImage || !animeImage) {
      const fallbackMatch = FALLBACK_QUOTES.find(f => f.character === newQuote.character);
      if (fallbackMatch) {
        characterImage = characterImage || fallbackMatch.characterImage || "";
        animeImage = animeImage || fallbackMatch.animeImage || "";
      }
    }

    // 4. Save to Database
    const now = new Date();
    if (db) {
      try {
        await db.insert(dailyQuote).values({
          id: QUOTE_SINGLETON_ID,
          quote: newQuote.quote,
          character: newQuote.character,
          anime: newQuote.anime,
          characterImage,
          animeImage,
          updatedAt: now
        }).onConflictDoUpdate({
          target: dailyQuote.id,
          set: {
            quote: newQuote.quote,
            character: newQuote.character,
            anime: newQuote.anime,
            characterImage,
            animeImage,
            updatedAt: now
          }
        });
      } catch (e) {
        console.error("Could not save quote to DB:", e);
      }
    }

    return {
      quote: newQuote.quote,
      character: newQuote.character,
      anime: newQuote.anime,
      characterImage: characterImage || undefined,
      animeImage: animeImage || undefined,
      isFallback
    };

  } catch (error) {
    console.error("Critical error in getDailyQuote:", error);
    return { ...FALLBACK_QUOTES[0], isFallback: true };
  }
}
