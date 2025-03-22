
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';

interface MovieMinimalResult {
  id: string;
  title: string;
  poster_path?: string;
  overview?: string;
  media_type?: string;
}

export const movieMinimalApi = {
  search: async (query: string): Promise<any[]> => {
    if (!query || query.length < 3) return [];
    
    // Check cache first
    const cacheKey = `movie:${query}`;
    const cachedData = cacheService.get(cacheKey, MediaCategory.MOVIE);
    if (cachedData) return cachedData;
    
    try {
      // Using free movie database API
      const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=2dca580c2a14b55200e784d157207b4d&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
      
      if (!response.ok) {
        throw new Error(`MovieMinimal API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results = data.results.slice(0, 5).map((item: MovieMinimalResult) => {
        let category = MediaCategory.MOVIE;
        if (item.media_type === 'tv') {
          category = MediaCategory.TV_SERIES;
        }
        
        return {
          id: item.id.toString(),
          title: item.title,
          imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '',
          description: item.overview || '',
          category
        };
      });
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.MOVIE);
      
      return results;
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }
};
