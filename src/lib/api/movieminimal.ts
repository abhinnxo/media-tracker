
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';
import { MediaSearchResult } from './index';

interface MovieMinimalResult {
  id: string;
  title: string;
  name?: string; // For TV shows
  poster_path?: string;
  overview?: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string; // For TV shows
  genre_ids?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

interface Genre {
  id: number;
  name: string;
}

// Define a list of common genres by ID from TMDb
const genreMap: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
};

export const movieMinimalApi = {
  search: async (query: string): Promise<MediaSearchResult[]> => {
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
      
      const results = await Promise.all(data.results.slice(0, 5).map(async (item: MovieMinimalResult) => {
        let category = MediaCategory.MOVIE;
        let title = item.title;
        let year: string | undefined;
        let episodeCount: number | undefined;
        
        if (item.media_type === 'tv') {
          category = MediaCategory.TV_SERIES;
          title = item.name || item.title;
          year = item.first_air_date ? item.first_air_date.split('-')[0] : undefined;
          
          // Try to fetch additional TV details to get episode count
          try {
            const tvDetailsResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${item.id}?api_key=2dca580c2a14b55200e784d157207b4d`
            );
            if (tvDetailsResponse.ok) {
              const tvDetails = await tvDetailsResponse.json();
              episodeCount = tvDetails.number_of_episodes || undefined;
            }
          } catch (error) {
            console.error('Error fetching TV details:', error);
          }
        } else {
          // Movie release year
          year = item.release_date ? item.release_date.split('-')[0] : undefined;
        }
        
        // Map genre IDs to genre names using our predefined map
        const genres = item.genre_ids 
          ? item.genre_ids.map(id => genreMap[id]).filter(Boolean)
          : undefined;
        
        // Fetch additional details to get director/creator for movies
        let creator: string | undefined;
        if (item.media_type === 'movie') {
          try {
            const creditsResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${item.id}/credits?api_key=2dca580c2a14b55200e784d157207b4d`
            );
            if (creditsResponse.ok) {
              const credits = await creditsResponse.json();
              // Get director from crew
              const director = credits.crew.find((person: any) => person.job === 'Director');
              if (director) {
                creator = director.name;
              }
            }
          } catch (error) {
            console.error('Error fetching movie credits:', error);
          }
        } else if (item.media_type === 'tv') {
          try {
            const creditsResponse = await fetch(
              `https://api.themoviedb.org/3/tv/${item.id}/credits?api_key=2dca580c2a14b55200e784d157207b4d`
            );
            if (creditsResponse.ok) {
              const credits = await creditsResponse.json();
              // Get creator from crew
              const showCreator = credits.crew.find((person: any) => 
                person.job === 'Creator' || person.job === 'Executive Producer'
              );
              if (showCreator) {
                creator = showCreator.name;
              }
            }
          } catch (error) {
            console.error('Error fetching TV credits:', error);
          }
        }
        
        return {
          id: item.id.toString(),
          title,
          imageUrl: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '',
          description: item.overview || '',
          category,
          year,
          creator,
          genres,
          episodeCount
        };
      }));
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.MOVIE);
      
      return results;
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  }
};
