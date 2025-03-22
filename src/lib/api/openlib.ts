
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';

interface OpenLibraryResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_sentence?: string[];
}

export const openLibraryApi = {
  search: async (query: string): Promise<any[]> => {
    if (!query || query.length < 3) return [];
    
    // Check cache first
    const cacheKey = `book:${query}`;
    const cachedData = cacheService.get(cacheKey, MediaCategory.BOOK);
    if (cachedData) return cachedData;
    
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error(`OpenLibrary API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results = data.docs.slice(0, 5).map((item: OpenLibraryResult) => {
        const olid = item.key.split('/').pop();
        
        return {
          id: olid || '',
          title: item.title,
          imageUrl: item.cover_i 
            ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` 
            : '',
          description: item.first_sentence ? item.first_sentence[0] : '',
          category: MediaCategory.BOOK,
          // Additional info
          author: item.author_name ? item.author_name[0] : ''
        };
      });
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.BOOK);
      
      return results;
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  }
};
