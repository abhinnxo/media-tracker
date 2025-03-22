
import { MediaCategory } from '@/lib/types';

interface CacheItem {
  data: any;
  timestamp: number;
  category: MediaCategory;
}

// Cache expiry time: 24 hours
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Simple in-memory cache for development
const memoryCache: Record<string, CacheItem> = {};

export const cacheService = {
  get: (key: string, category: MediaCategory): any | null => {
    const item = memoryCache[key];
    if (!item) return null;
    
    // Check if cache is expired
    if (Date.now() - item.timestamp > CACHE_EXPIRY) {
      delete memoryCache[key];
      return null;
    }
    
    // Only return if category matches
    if (item.category !== category) return null;
    
    return item.data;
  },
  
  set: (key: string, data: any, category: MediaCategory): void => {
    memoryCache[key] = {
      data,
      timestamp: Date.now(),
      category
    };
  },
  
  clear: (): void => {
    Object.keys(memoryCache).forEach(key => {
      delete memoryCache[key];
    });
  }
};
