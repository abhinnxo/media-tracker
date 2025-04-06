
import { MediaCategory } from "@/lib/types";
import { MediaSearchResult } from "./index";

interface CacheItem {
  data: MediaSearchResult[];
  timestamp: number;
  category: MediaCategory;
}

// Cache expiration time: 1 hour
const CACHE_EXPIRATION = 60 * 60 * 1000; 

class CacheService {
  private cache: Record<string, CacheItem> = {};

  set(key: string, data: MediaSearchResult[], category: MediaCategory): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      category,
    };
  }

  get(key: string, category: MediaCategory): MediaSearchResult[] | null {
    const item = this.cache[key];
    
    if (!item) return null;
    
    // Check if the item is expired
    if (Date.now() - item.timestamp > CACHE_EXPIRATION) {
      delete this.cache[key];
      return null;
    }
    
    // Check if the category matches
    if (item.category !== category) return null;
    
    return item.data;
  }

  clear(): void {
    this.cache = {};
  }
}

export const cacheService = new CacheService();
