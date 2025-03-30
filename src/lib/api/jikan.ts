
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';
import { MediaSearchResult } from './index';

interface JikanAnimeResult {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    }
  };
  synopsis: string;
  year?: number;
  aired?: {
    prop?: {
      from?: {
        year?: number;
      }
    }
  };
  studios?: Array<{
    name: string;
  }>;
  genres?: Array<{
    name: string;
  }>;
  episodes?: number;
}

export const jikanApi = {
  search: async (query: string): Promise<MediaSearchResult[]> => {
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
      const results = data.data.map((item: JikanAnimeResult) => {
        // Get year from aired property or year property
        const year = item.aired?.prop?.from?.year || item.year;
        
        // Get studio names (directors)
        const creator = item.studios && item.studios.length > 0 
          ? item.studios[0].name 
          : undefined;
          
        // Get genres
        const genres = item.genres 
          ? item.genres.map(g => g.name) 
          : undefined;
        
        return {
          id: item.mal_id.toString(),
          title: item.title,
          imageUrl: item.images.jpg.image_url,
          description: item.synopsis || '',
          category: MediaCategory.ANIME,
          year: year ? year.toString() : undefined,
          creator,
          genres,
          episodeCount: item.episodes
        };
      });
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.ANIME);
      
      return results;
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }
};
