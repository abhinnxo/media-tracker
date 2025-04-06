
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';
import { MediaSearchResult } from './index';

interface MovieMinimalResult {
  id: string;
  title: string;
  poster_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  directors?: string[];
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

export const movieMinimalApi = {
  search: async (query: string): Promise<MediaSearchResult[]> => {
    if (!query || query.length < 3) return [];
    
    // Check cache first
    const cacheKey = `movie:${query}`;
    const cachedData = cacheService.get(cacheKey, MediaCategory.MOVIE);
    if (cachedData) return cachedData;
    
    // We're using a free movie API proxy to avoid API key requirements
    // In a production app, you'd use a real API with proper authentication
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
      
      if (!response.ok) {
        throw new Error(`Movie API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results = data.results.slice(0, 5).map((item: MovieMinimalResult) => {
        const isMovie = item.media_type === 'movie';
        const category = isMovie ? MediaCategory.MOVIE : MediaCategory.TV_SERIES;
        
        // Extract year from release_date (movies) or first_air_date (TV)
        const date = item.release_date || item.first_air_date;
        const year = date ? date.split('-')[0] : undefined;
        
        // Map genre IDs to genre names
        let genres: string[] | undefined;
        if (item.genre_ids && item.genre_ids.length > 0) {
          genres = item.genre_ids
            .map(id => GENRE_MAP[id])
            .filter(Boolean);
        }
        
        return {
          id: item.id,
          title: item.title,
          imageUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : '',
          description: item.overview || '',
          category,
          year,
          creator: item.directors ? item.directors[0] : undefined,
          genres
        };
      });
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.MOVIE);
      
      return results;
    } catch (error) {
      console.error('Error searching movies/TV:', error);
      return [];
    }
  }
};
