
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';

interface JikanAnimeResult {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    }
  };
  synopsis: string;
}

export const jikanApi = {
  search: async (query: string): Promise<any[]> => {
    if (!query || query.length < 3) return [];
    
    // Check cache first
    const cacheKey = `anime:${query}`;
    const cachedData = cacheService.get(cacheKey, MediaCategory.ANIME);
    if (cachedData) return cachedData;
    
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.data.map((item: JikanAnimeResult) => ({
        id: item.mal_id.toString(),
        title: item.title,
        imageUrl: item.images.jpg.image_url,
        description: item.synopsis || '',
        category: MediaCategory.ANIME
      }));
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.ANIME);
      
      return results;
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }
};
