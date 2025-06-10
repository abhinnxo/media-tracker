
// Comprehensive caching implementation with TTL support
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  version: string;
}

class CacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      defaultTtl: config.defaultTtl || 15 * 60 * 1000, // 15 minutes
      version: config.version || '1.0.0'
    };
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Clean cache if at max size
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
      version: this.config.version
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check version compatibility
    if (item.version !== this.config.version) {
      this.cache.delete(key);
      return null;
    }
    
    // Check TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // LRU eviction
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      version: this.config.version,
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        age: Date.now() - item.timestamp,
        ttl: item.ttl
      }))
    };
  }
}

// Create different cache instances for different data types
export const apiCache = new CacheManager({
  maxSize: 200,
  defaultTtl: 24 * 60 * 60 * 1000, // 24 hours for TMDB data
  version: '1.0.0'
});

export const userCache = new CacheManager({
  maxSize: 50,
  defaultTtl: 5 * 60 * 1000, // 5 minutes for user data
  version: '1.0.0'
});

export const searchCache = new CacheManager({
  maxSize: 100,
  defaultTtl: 15 * 60 * 1000, // 15 minutes for search results
  version: '1.0.0'
});

// Helper functions for common cache operations
export const cacheHelpers = {
  // Generate cache key for API calls
  generateApiKey: (endpoint: string, params: Record<string, any> = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `api:${endpoint}:${sortedParams}`;
  },

  // Generate cache key for user data
  generateUserKey: (userId: string, dataType: string) => {
    return `user:${userId}:${dataType}`;
  },

  // Generate cache key for search results
  generateSearchKey: (query: string, category: string) => {
    return `search:${category}:${query.toLowerCase()}`;
  },

  // Invalidate related cache entries
  invalidatePattern: (pattern: string) => {
    const caches = [apiCache, userCache, searchCache];
    caches.forEach(cache => {
      const stats = cache.getStats();
      stats.items.forEach(item => {
        if (item.key.includes(pattern)) {
          cache.delete(item.key);
        }
      });
    });
  }
};
