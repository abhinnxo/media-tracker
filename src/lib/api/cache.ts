import { MediaCategory } from '@/lib/types';
import { apiCache, cacheHelpers } from '@/lib/cache-manager';

interface CacheItem {
  data: any;
  timestamp: number;
  category: MediaCategory;
}

// Cache expiry time: 24 hours
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Enhanced cache service using the new cache manager
export const cacheService = {
  get: (key: string, category: MediaCategory): any | null => {
    // Try new cache manager first
    const cached = apiCache.get(key);
    if (cached) {
      return cached;
    }

    // Fallback to memory cache for backward compatibility
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
    // Store in new cache manager
    apiCache.set(key, data);
    
    // Keep memory cache for backward compatibility
    memoryCache[key] = {
      data,
      timestamp: Date.now(),
      category
    };
  },
  
  clear: (): void => {
    apiCache.clear();
    Object.keys(memoryCache).forEach(key => {
      delete memoryCache[key];
    });
  },

  // New methods using cache manager
  invalidateCategory: (category: MediaCategory): void => {
    cacheHelpers.invalidatePattern(category);
  },

  getStats: () => {
    return apiCache.getStats();
  }
};

// Simple in-memory cache for backward compatibility
const memoryCache: Record<string, CacheItem> = {};
