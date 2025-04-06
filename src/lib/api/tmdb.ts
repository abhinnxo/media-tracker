
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';
import { MediaSearchResult } from './index';

interface TrendingResult {
  id: string;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  vote_average?: number;
  video?: boolean;
}

interface TrailerResult {
  id: string;
  title: string;
  imageUrl: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  trailerKey?: string;
  overview: string;
}

// TMDB genre IDs mapping
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

export const tmdbApi = {
  getTrendingTrailers: async (mediaType: 'all' | 'movie' | 'tv' = 'all'): Promise<TrailerResult[]> => {
    // Cache key includes media type for different caches
    const cacheKey = `trending:${mediaType}`;
    const cachedData = cacheService.get(cacheKey, MediaCategory.MOVIE);
    if (cachedData) return cachedData as unknown as TrailerResult[];
    
    try {
      const response = await fetch(`https://api.themoviedb.org/3/trending/${mediaType}/day?language=en-US`);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the results to include trailer keys where available
      const resultsWithTrailers = await Promise.all(
        data.results.slice(0, 8).map(async (item: TrendingResult) => {
          // For movies with video flag true, fetch trailer data
          let trailerKey: string | undefined = undefined;
          
          if (item.media_type === 'movie') {
            try {
              const videosResponse = await fetch(`https://api.themoviedb.org/3/movie/${item.id}/videos?language=en-US`);
              if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                const trailer = videosData.results.find(
                  (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
                );
                trailerKey = trailer ? trailer.key : undefined;
              }
            } catch (error) {
              console.error('Error fetching trailer:', error);
            }
          }
          
          const title = item.title || item.name || '';
          const releaseDate = item.release_date || item.first_air_date;
          
          // Map genre IDs to genre names
          const genres = item.genre_ids
            ? item.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean)
            : [];
            
          return {
            id: item.id,
            title,
            imageUrl: item.poster_path 
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
              : null,
            backdropUrl: item.backdrop_path 
              ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` 
              : null,
            mediaType: item.media_type,
            releaseDate,
            trailerKey,
            overview: item.overview,
            genres
          };
        })
      );
      
      // Cache the results
      cacheService.set(cacheKey, resultsWithTrailers as unknown as MediaSearchResult[], MediaCategory.MOVIE);
      
      return resultsWithTrailers;
    } catch (error) {
      console.error('Error fetching trending media:', error);
      return [];
    }
  },
  
  getMediaVideos: async (mediaId: string, mediaType: 'movie' | 'tv'): Promise<string | null> => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/videos?language=en-US`);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Find a YouTube trailer
      const trailer = data.results.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      return trailer ? trailer.key : null;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return null;
    }
  }
};
