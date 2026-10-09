// High-quality category-based fallback photos from Unsplash
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Main: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  Appetizer: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80',
  Dessert: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=80',
  Baking: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80',
  Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1000&q=80',
  Beverage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=80',
  Side: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
  Sauce: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=1000&q=80',
};

const GENERIC_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80';

// In-memory cache for search results to avoid redundant API calls
const imageCache = new Map<string, string>();

/**
 * Checks whether an image URL is valid and non-placeholder.
 */
export function isGoodImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;

  // Ignore default generic placeholders
  if (trimmed.includes('photo-1495521821757-a1efb6729352') || trimmed.includes('photo-1513104890138-7c749659a591')) {
    return false;
  }

  // Reject local file paths or empty URLs
  if (trimmed.includes('emulated/0') || trimmed.includes('localhost') || trimmed.endsWith('.invalid')) {
    return false;
  }

  return true;
}

/**
 * Searches Wikimedia Commons for a royalty-free image matching a dish name.
 */
async function searchWikimediaImage(query: string): Promise<string | null> {
  if (!query || query.trim().length < 2) return null;
  const cleanQuery = query.trim();

  try {
    const endpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      cleanQuery + ' filetype:bitmap'
    )}&gsrlimit=3&prop=imageinfo&iiprop=url&format=json&origin=*`;

    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.query?.pages) return null;

    const pages = Object.values(data.query.pages) as any[];
    for (const page of pages) {
      const url = page.imageinfo?.[0]?.url;
      if (url && typeof url === 'string') {
        const lower = url.toLowerCase();
        // Ignore icon files or banners
        if (!lower.endsWith('.svg') && !lower.includes('icon') && !lower.includes('logo')) {
          return url;
        }
      }
    }
  } catch (err) {
    // Non-blocking error
  }

  return null;
}

/**
 * Generates search candidate terms for a recipe title.
 * For example: "Aubergine balletjes (melitzanokeftedes)" ->
 * ["melitzanokeftedes", "Aubergine balletjes", "Aubergine"]
 */
function extractSearchTerms(title: string, tags: string[] = []): string[] {
  const terms: string[] = [];
  const trimmed = title.trim();

  // If there is text inside parentheses, e.g. "(melitzanokeftedes)"
  const parenMatch = trimmed.match(/\((.*?)\)/);
  if (parenMatch && parenMatch[1].trim().length > 2) {
    terms.push(parenMatch[1].trim());
  }

  // Clean title without parentheses
  const withoutParen = trimmed.replace(/\(.*?\)/g, '').trim();
  if (withoutParen) {
    terms.push(withoutParen);
  }

  // First 2 words of the clean title if multi-word
  const words = withoutParen.split(/\s+/);
  if (words.length > 2) {
    terms.push(words.slice(0, 2).join(' '));
  }

  // Tags
  for (const tag of tags) {
    if (tag && tag.length > 2 && !terms.includes(tag)) {
      terms.push(tag);
    }
  }

  return terms;
}

/**
 * Finds a suitable image for a recipe.
 * 1. Checks if current image is already good.
 * 2. If not, queries Wikimedia Commons using dish title candidates.
 * 3. Falls back to a curated Unsplash image based on the recipe's category.
 */
export async function findImageForRecipe(
  title: string,
  category: string = 'Main',
  currentImage?: string | null,
  tags: string[] = []
): Promise<string> {
  // If current image is already a real valid URL, keep it
  if (isGoodImageUrl(currentImage)) {
    return currentImage!;
  }

  const cacheKey = `${title.toLowerCase().trim()}_${category}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const candidateTerms = extractSearchTerms(title, tags);

  for (const term of candidateTerms) {
    const foundUrl = await searchWikimediaImage(term);
    if (foundUrl) {
      imageCache.set(cacheKey, foundUrl);
      return foundUrl;
    }
  }

  // Category fallback
  const fallback = CATEGORY_FALLBACK_IMAGES[category] || GENERIC_RECIPE_IMAGE;
  imageCache.set(cacheKey, fallback);
  return fallback;
}
