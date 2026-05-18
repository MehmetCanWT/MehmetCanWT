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

const FALLBACK_QUOTES = [
  { quote: "Believe in the me that believes in you!", character: "Kamina", anime: "Gurren Lagann", characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/b2075-sWb5Xz76JWdX.png", animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx2001-XwRnjzGeFWRQ.png" },
  { quote: "I am the hope of the universe. I am the answer to all living things that cry out for peace.", character: "Goku", anime: "Dragon Ball Z", characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/246-wsRRr6z1kii8.png", animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx813-ZhnFNOeCU5dQ.png" },
  { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece", characterImage: "https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png", animeImage: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx21-ELSYx3yMPcKM.jpg" }
];

export async function getDailyQuote(forceUpdate: boolean = false): Promise<QuoteData> {
  try {
    if (!forceUpdate) {
      // 1. Check database for existing quote
      let dbQuotes: any[] = [];
      if (db) {
        dbQuotes = await db.select().from(dailyQuote).where(eq(dailyQuote.id, "global")).catch(() => []);
      }
      const dbQuoteItem = dbQuotes[0];

      // If it exists and is less than 24 hours old, return it
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
    }

    // 2. Fetch new quote from Yurippe API
    let newQuote = { quote: "", character: "", anime: "" };
    let isFallback = false;
    try {
      const quoteRes = await fetch("https://yurippe.vercel.app/api/quotes?random=1");
      const quoteData = await quoteRes.json();

      if (Array.isArray(quoteData) && quoteData.length > 0 && quoteData[0].quote) {
        newQuote = {
          quote: quoteData[0].quote,
          character: quoteData[0].character,
          anime: quoteData[0].show // Yurippe API uses 'show' instead of 'anime'
        };
      } else {
        throw new Error("Invalid quote data from Yurippe API");
      }
    } catch (e) {
      console.error("Failed to fetch from Yurippe API, using fallback.", e);
      isFallback = true;
      // Pick random fallback
      const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      newQuote = {
        quote: fallback.quote,
        character: fallback.character,
        anime: fallback.anime
      };
    }

    // 3. Fetch images from Anilist GraphQL API to avoid Jikan rate limits
    let characterImage = "";
    let animeImage = "";

    try {
      if (!isFallback) {
        const charQuery = `query ($search: String) { Character(search: $search) { image { large } } }`;
        const charRes = await fetch("https://graphql.anilist.co", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: charQuery, variables: { search: newQuote.character } })
        });
        const charData = await charRes.json();
        characterImage = charData?.data?.Character?.image?.large || "";
      }
    } catch (e) {
      console.error("Failed to fetch character image from Anilist", e);
    }

    try {
      if (!isFallback) {
        const animeQuery = `query ($search: String) { Media(search: $search, type: ANIME) { coverImage { large } } }`;
        const animeRes = await fetch("https://graphql.anilist.co", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: animeQuery, variables: { search: newQuote.anime } })
        });
        const animeData = await animeRes.json();
        animeImage = animeData?.data?.Media?.coverImage?.large || "";
      }
    } catch (e) {
      console.error("Failed to fetch anime image from Anilist", e);
    }

    // Fallbacks for images if API failed or if we are already using a fallback quote
    if (isFallback || !characterImage || !animeImage) {
        const fallbackMatch = FALLBACK_QUOTES.find(f => f.character === newQuote.character);
        if (fallbackMatch) {
            characterImage = characterImage || fallbackMatch.characterImage || "";
            animeImage = animeImage || fallbackMatch.animeImage || "";
        }
    }

    // 4. Save to Database
    if (db) {
      try {
        await db.insert(dailyQuote).values({
          id: "global",
          quote: newQuote.quote,
          character: newQuote.character,
          anime: newQuote.anime,
          characterImage,
          animeImage,
          updatedAt: new Date()
        }).onConflictDoUpdate({
          target: dailyQuote.id,
          set: {
            quote: newQuote.quote,
            character: newQuote.character,
            anime: newQuote.anime,
            characterImage,
            animeImage,
            updatedAt: new Date()
          }
        });
      } catch (e) {
        console.error("Could not save quote to DB - likely offline");
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
    console.error("Critical error in getDailyQuote", error);
    return { ...FALLBACK_QUOTES[0], isFallback: true };
  }
}
