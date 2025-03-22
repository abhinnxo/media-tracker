
import { MediaCategory } from '@/lib/types';
import { cacheService } from './cache';

interface MangaDexResult {
  id: string;
  attributes: {
    title: {
      en: string;
    };
    description: {
      en: string;
    };
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: {
      fileName: string;
    };
  }>;
}

export const mangadexApi = {
  search: async (query: string): Promise<any[]> => {
    if (!query || query.length < 3) return [];
    
    // Check cache first
    const cacheKey = `manga:${query}`;
    const cachedData = cacheService.get(cacheKey, MediaCategory.MANGA);
    if (cachedData) return cachedData;
    
    try {
      const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=5&includes[]=cover_art`);
      
      if (!response.ok) {
        throw new Error(`MangaDex API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const results = await Promise.all(data.data.map(async (item: MangaDexResult) => {
        const coverRel = item.relationships.find(rel => rel.type === 'cover_art');
        let imageUrl = '';
        
        if (coverRel && coverRel.id) {
          imageUrl = `https://uploads.mangadex.org/covers/${item.id}/${coverRel.attributes?.fileName}`;
        }
        
        return {
          id: item.id,
          title: item.attributes.title.en,
          imageUrl,
          description: item.attributes.description?.en || '',
          category: MediaCategory.MANGA
        };
      }));
      
      // Cache the results
      cacheService.set(cacheKey, results, MediaCategory.MANGA);
      
      return results;
    } catch (error) {
      console.error('Error searching manga:', error);
      return [];
    }
  }
};
