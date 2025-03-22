
import { MediaCategory } from '@/lib/types';
import { jikanApi } from './jikan';
import { mangadexApi } from './mangadex';
import { openLibraryApi } from './openlib';
import { movieMinimalApi } from './movieminimal';
import { cacheService } from './cache';

export interface MediaSearchResult {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: MediaCategory;
}

export const mediaApi = {
  search: async (query: string, category: MediaCategory): Promise<MediaSearchResult[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      switch (category) {
        case MediaCategory.ANIME:
          return await jikanApi.search(query);
        case MediaCategory.MANGA:
          return await mangadexApi.search(query);
        case MediaCategory.BOOK:
          return await openLibraryApi.search(query);
        case MediaCategory.MOVIE:
        case MediaCategory.TV_SERIES:
          return await movieMinimalApi.search(query);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error searching ${category}:`, error);
      return [];
    }
  },
  
  clearCache: (): void => {
    cacheService.clear();
  }
};
